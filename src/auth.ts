import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

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
    ],
    pages: {
        signIn: "/auth/login",
        signOut: "/",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // After sign in, redirect to student dashboard
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith("/")) return `${baseUrl}${url}`
            return `${baseUrl}/dashboard/student`
        },
    },
})
