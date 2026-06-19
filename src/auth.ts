import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"
import { BruteForceProtection, createBruteForceIdentifier, type BruteForceCheckResult } from "@/lib/services/brute-force-protection.service"
import { generateReferralCode } from "@/lib/services/referral.service"

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

declare module "next-auth/jwt" {
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
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    adapter: {
        ...PrismaAdapter(prisma),
        createUser: async (user) => {
            try {
                console.log("[auth][db] Attempting to create user:", user.email);
                const referralCode = await generateReferralCode();
                const { id, ...userData } = user; // NextAuth passes a UUID, but MongoDB needs a 24-char hex. Destructuring removes it.
                const newUser = await prisma.user.create({
                    data: {
                        ...userData,
                        emailVerified: userData.emailVerified || new Date(),
                        referralCode,
                    },
                });
                console.log("[auth][db] User created successfully:", newUser.id);
                return newUser as any;
            } catch (dbError) {
                console.error("🔥 [CRITICAL DATABASE ERROR in createUser] 🔥", dbError);
                throw dbError; // Rethrow to let NextAuth handle the redirect
            }
        },
        getUser: async (id) => {
            try {
                return await prisma.user.findUnique({ where: { id } }) as any;
            } catch (dbError) {
                console.error("🔥 [CRITICAL DATABASE ERROR in getUser] 🔥", dbError);
                throw dbError;
            }
        },
        getUserByEmail: async (email) => {
            try {
                return await prisma.user.findUnique({ where: { email } }) as any;
            } catch (dbError) {
                console.error("🔥 [CRITICAL DATABASE ERROR in getUserByEmail] 🔥", dbError);
                throw dbError;
            }
        },
        getUserByAccount: async (provider_providerAccountId) => {
            try {
                const account = await prisma.account.findUnique({
                    where: { provider_providerAccountId },
                    select: { user: true },
                });
                return (account?.user as any) ?? null;
            } catch (dbError) {
                console.error("🔥 [CRITICAL DATABASE ERROR in getUserByAccount] 🔥", dbError);
                throw dbError;
            }
        },
    },
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID ? [Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        })] : []),
        ...(process.env.GITHUB_CLIENT_ID ? [GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        })] : []),
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
                if (!user.emailVerified && user.role !== "ADMIN") {
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
            try {
                // For OAuth providers, fetch additional user data
                if (account?.provider === "google" || account?.provider === "github") {
                    if (user.email) {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: user.email },
                            select: {
                                id: true,
                                emailVerified: true,
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

                            if (!dbUser.emailVerified) {
                                await prisma.user.update({
                                    where: { id: dbUser.id },
                                    data: { emailVerified: new Date() },
                                }).catch((err) => console.error("Failed to auto-verify OAuth user:", err));
                            }
                        }
                    }
                }
                return true;
            } catch (error) {
                console.error("🔥 [CRITICAL ERROR in signIn callback] 🔥", error);
                // Return true anyway so we don't block login if it's just a missing field
                return true; 
            }
        },
        async jwt({ token, user, trigger, session }) {
            try {
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
            } catch (error) {
                console.error("🔥 [CRITICAL ERROR in jwt callback] 🔥", error);
                return token;
            }
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
            // Force your real domain to avoid any internal Cloud Run URLs
            const customDomain = "https://velonx.in";
            
            if (url.startsWith(customDomain)) return url;
            if (url.startsWith("/")) return `${customDomain}${url}`;

            return `${customDomain}/dashboard/student`;
        },
    },

    debug: true, // Enable debug messages in the console
    logger: {
        error(error) {
            console.error(`[auth][error]`, error);
        },
        warn(code) {
            console.warn(`[auth][warn] ${code}`);
        },
        debug(code, metadata) {
            console.log(`[auth][debug] ${code}`, metadata);
        },
    },
})
