import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"
import { BruteForceProtection, createBruteForceIdentifier } from "@/lib/services/brute-force-protection.service"

// Extend the session type to include custom properties
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            name?: string | null
            email?: string | null
            image?: string | null
            role?: UserRole
        }
    }
    
    interface User {
        role?: UserRole
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role?: UserRole
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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

                // Create identifier for brute force protection
                // Note: In a real implementation, we'd get the IP from the request
                // For now, we'll use email as the identifier
                const identifier = createBruteForceIdentifier(
                    credentials.email as string,
                    'unknown' // IP would be extracted from request in middleware
                );

                // Check brute force protection
                const bruteForceCheck = await BruteForceProtection.checkAttempt(identifier);
                
                if (!bruteForceCheck.allowed) {
                    console.log("🚫 Brute force protection triggered:", bruteForceCheck.message);
                    
                    // Return null to indicate failed authentication
                    // The error message will be shown to the user
                    throw new Error(bruteForceCheck.message || 'Too many failed attempts');
                }

                // Apply progressive delay if there were previous failed attempts
                if (bruteForceCheck.delayMs > 0) {
                    console.log(`⏱️ Applying ${bruteForceCheck.delayMs}ms delay due to previous failed attempts`);
                    await BruteForceProtection.applyDelay(bruteForceCheck.delayMs);
                }

                // Find user in database
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                console.log("👤 User found:", user ? {
                    email: user.email,
                    role: user.role,
                    hasPassword: !!user.password
                } : "null");

                if (!user || !user.password) {
                    console.log("❌ User not found or no password");
                    
                    // Record failed attempt
                    await BruteForceProtection.recordFailedAttempt(identifier);
                    
                    return null;
                }

                // Verify password
                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                console.log("🔑 Password valid:", isValid);

                if (!isValid) {
                    console.log("❌ Invalid password");
                    
                    // Record failed attempt
                    await BruteForceProtection.recordFailedAttempt(identifier);
                    
                    return null;
                }

                // Verify role if provided (optional check for admin login)
                if (credentials.role && credentials.role === "admin" && user.role !== "ADMIN") {
                    console.log("❌ Role mismatch - requested:", credentials.role, "user role:", user.role);
                    
                    // Record failed attempt
                    await BruteForceProtection.recordFailedAttempt(identifier);
                    
                    return null;
                }

                console.log("✅ Authorization successful!");

                // Record successful attempt (clears failed attempts counter)
                await BruteForceProtection.recordSuccessfulAttempt(identifier);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "STUDENT";
            }
            
            // Fetch latest user data on session update
            if (trigger === "update" && token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { 
                        role: true,
                        name: true,
                        image: true,
                    },
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
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
