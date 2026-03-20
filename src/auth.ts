import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"
import { BruteForceProtection, createBruteForceIdentifier, type BruteForceCheckResult } from "@/lib/services/brute-force-protection.service"

// Extend the session type to include custom properties
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            name?: string | null
            email?: string | null
            image?: string | null
            role?: UserRole
            xp?: number
            level?: number
            currentStreak?: number
            longestStreak?: number
        }
    }

    interface User {
        role?: UserRole
        xp?: number
        level?: number
        currentStreak?: number
        longestStreak?: number
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role?: UserRole
        xp?: number
        level?: number
        currentStreak?: number
        longestStreak?: number
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
                console.log("🔐 Authorize called with:", {
                    email: credentials?.email,
                    role: credentials?.role,
                    hasPassword: !!credentials?.password
                });

                if (!credentials?.email || !credentials?.password) {
                    console.log("❌ Missing email or password");
                    return null;
                }

                const identifier = createBruteForceIdentifier(
                    credentials.email as string,
                    'unknown'
                );

                // Run brute force check with a 2s timeout so slow Redis doesn't block login
                // Also start the DB lookup in parallel
                const bruteForcePromise = Promise.race([
                    BruteForceProtection.checkAttempt(identifier),
                    new Promise<BruteForceCheckResult>((resolve) =>
                        setTimeout(() => resolve({
                            allowed: true,
                            attemptsRemaining: 5,
                            delayMs: 0,
                        }), 2000)
                    ),
                ]);

                const userPromise = prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        password: true,
                        role: true,
                        emailVerified: true,
                        xp: true,
                        level: true,
                        currentStreak: true,
                        longestStreak: true,
                    },
                });

                const [bruteForceCheck, user] = await Promise.all([
                    bruteForcePromise,
                    userPromise,
                ]);

                if (!bruteForceCheck.allowed) {
                    console.log("🚫 Brute force protection triggered:", bruteForceCheck.message);
                    throw new Error(bruteForceCheck.message || 'Too many failed attempts');
                }

                console.log("👤 User found:", user ? {
                    email: user.email,
                    role: user.role,
                    hasPassword: !!user.password
                } : "null");

                if (!user || !user.password) {
                    console.log("❌ User not found or no password");
                    // Fire-and-forget: don't block login response
                    BruteForceProtection.recordFailedAttempt(identifier).catch(() => { });
                    return null;
                }

                // Check for email verification
                if (!user.emailVerified) {
                    console.log("❌ Email not verified");
                    // Do not block brute force as missing verification isn't a malicious attack
                    throw new Error("Please verify your email address before logging in.");
                }

                // Verify password
                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                console.log("🔑 Password valid:", isValid);

                if (!isValid) {
                    console.log("❌ Invalid password");
                    // Fire-and-forget: don't block login response
                    BruteForceProtection.recordFailedAttempt(identifier).catch(() => { });
                    return null;
                }

                // Verify role if provided
                if (credentials.role && credentials.role === "admin" && user.role !== "ADMIN") {
                    console.log("❌ Role mismatch - requested:", credentials.role, "user role:", user.role);
                    BruteForceProtection.recordFailedAttempt(identifier).catch(() => { });
                    return null;
                }

                console.log("✅ Authorization successful!");

                // Fire-and-forget: don't block login response
                BruteForceProtection.recordSuccessfulAttempt(identifier).catch(() => { });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    xp: user.xp,
                    level: user.level,
                    currentStreak: user.currentStreak,
                    longestStreak: user.longestStreak,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers, fetch additional user data
            if (account?.provider === "google" || account?.provider === "github") {
                if (user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        select: {
                            xp: true,
                            level: true,
                            currentStreak: true,
                            longestStreak: true,
                        },
                    });
                    if (dbUser) {
                        user.xp = dbUser.xp;
                        user.level = dbUser.level;
                        user.currentStreak = dbUser.currentStreak;
                        user.longestStreak = dbUser.longestStreak;
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "STUDENT";
                token.xp = user.xp;
                token.level = user.level;
                token.currentStreak = user.currentStreak;
                token.longestStreak = user.longestStreak;
            }

            // Fetch latest user data on session update
            if (trigger === "update" && token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: {
                        role: true,
                        name: true,
                        image: true,
                        xp: true,
                        level: true,
                        currentStreak: true,
                        longestStreak: true,
                    },
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                    token.xp = dbUser.xp;
                    token.level = dbUser.level;
                    token.currentStreak = dbUser.currentStreak;
                    token.longestStreak = dbUser.longestStreak;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.role = token.role as UserRole;
                session.user.name = token.name as string | null;
                session.user.image = token.picture as string | null;
                session.user.xp = token.xp as number | undefined;
                session.user.level = token.level as number | undefined;
                session.user.currentStreak = token.currentStreak as number | undefined;
                session.user.longestStreak = token.longestStreak as number | undefined;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // After sign in, redirect based on role
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith("/")) return `${baseUrl}${url}`;

            // Default redirect - will be overridden by callback in signup/login
            return `${baseUrl}/dashboard/student`;
        },
    },
})
