import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

// Extend the session type to include custom properties
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            name?: string | null
            email?: string | null
            image?: string | null
            role?: "student" | "admin"
        }
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                // This is a demo simulation. In a real app, you would validate against a database.
                if (!credentials?.email || !credentials?.password) return null;

                // For demo: any valid-looking email/password works
                // Assign role based on domain or passed role
                const email = credentials.email as string;
                const role = (credentials.role as "admin" | "student") ||
                    (email.endsWith("@velonx.com") ? "admin" : "student");

                return {
                    id: role === "admin" ? "admin-1" : "student-1",
                    name: role === "admin" ? "Velonx Admin" : "Velonx Student",
                    email: email,
                    role: role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days - keeps user logged in
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // Use the role from the user object if available (e.g. from Credentials authorize)
                // Otherwise fallback to email domain check
                token.role = (user as any).role || (user.email?.endsWith("@velonx.com") ? "admin" : "student")
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "student" | "admin"
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // After sign in, redirect based on role (default to student dashboard)
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith("/")) return `${baseUrl}${url}`
            return `${baseUrl}/dashboard/student`
        },
    },
})
