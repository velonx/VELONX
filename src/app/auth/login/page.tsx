"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Mail, Lock, Eye, EyeOff, Github, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user && !isRedirecting) {
            const dashboardPath = session.user.role === "ADMIN"
                ? "/dashboard/admin"
                : "/dashboard/student";
            router.push(dashboardPath);
        }
    }, [status, session, router, isRedirecting]);

    const handleLogin = async (role: "student" | "admin") => {
        setLoading(true);
        setIsRedirecting(true);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                role,
                redirect: false,
            });
            if (result?.ok) {
                await new Promise(resolve => setTimeout(resolve, 800));
                const callbackUrl = role === "admin" ? "/dashboard/admin" : "/dashboard/student";
                router.push(callbackUrl);
            } else {
                setIsRedirecting(false);
                setLoading(false);
            }
        } catch {
            setIsRedirecting(false);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard/student" });
        } catch {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        try {
            await signIn("github", { callbackUrl: "/dashboard/student" });
        } catch {
            setLoading(false);
        }
    };

    return (
        /* Full viewport, never scroll — clears the fixed floating navbar (top-6 + ~50px height ≈ 80px) */
        <div className="h-screen overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#0f1624] font-outfit transition-colors duration-300 pt-20 pb-4 px-4">

            {/* Card */}
            <div className="w-full max-w-5xl h-full max-h-[calc(100vh-6rem)] flex rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1e2d45]">

                {/* ───── LEFT — Form ───── */}
                <div className="flex-1 flex flex-col justify-center px-8 py-6 bg-white dark:bg-[#131c2e] transition-colors duration-300 overflow-y-auto">
                    <div className="w-full max-w-xs mx-auto">

                        {/* Brand */}
                        <div className="mb-5">
                            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] bg-clip-text text-transparent">
                                Velonx
                            </span>
                            <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                                Welcome back
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Sign in to continue your learning journey
                            </p>
                        </div>

                        {/* Tabs — Student / Admin */}
                        <Tabs defaultValue="student" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-5 bg-slate-100 dark:bg-[#1e2d45] p-1 rounded-xl border border-slate-200 dark:border-[#2a3e5c]">
                                <TabsTrigger
                                    value="student"
                                    className="rounded-lg py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#219EBC] data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all gap-1.5"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Student
                                </TabsTrigger>
                                <TabsTrigger
                                    value="admin"
                                    className="rounded-lg py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#219EBC] data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all gap-1.5"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Admin
                                </TabsTrigger>
                            </TabsList>

                            {["student", "admin"].map((role) => (
                                <TabsContent key={role} value={role} className="mt-0">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleLogin(role as "student" | "admin"); }}
                                        className="space-y-3"
                                    >
                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                                Email address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    placeholder={role === "student" ? "student@example.com" : "admin@velonx.com"}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    Password
                                                </label>
                                                <Link href="#" className="text-xs text-[#219EBC] hover:text-[#1a7a94] transition-colors font-medium">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <div className="flex justify-end mt-1.5 pt-1">
                                                <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#219EBC] hover:text-[#1a7a94] transition-colors">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Remember me */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="remember-me"
                                                className="w-3.5 h-3.5 rounded accent-[#219EBC] cursor-pointer"
                                            />
                                            <label htmlFor="remember-me" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                                Keep me signed in
                                            </label>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#219EBC] to-[#1a7a94] hover:from-[#1a7a94] hover:to-[#156880] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl py-2.5 transition-all duration-200 shadow-md shadow-[#219EBC]/20 mt-1 group"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Signing in...
                                                </span>
                                            ) : (
                                                <>
                                                    Sign In
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </TabsContent>
                            ))}
                        </Tabs>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#2a3e5c]" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">or continue with</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#2a3e5c]" />
                        </div>

                        {/* Social Logins */}
                        <div className="flex items-center gap-3">
                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-white dark:bg-[#1e2d45] hover:bg-slate-50 dark:hover:bg-[#243349] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                                aria-label="Sign in with Google"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>

                            {/* GitHub */}
                            <button
                                onClick={handleGitHubLogin}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-white dark:bg-[#1e2d45] hover:bg-slate-50 dark:hover:bg-[#243349] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                                aria-label="Sign in with GitHub"
                            >
                                <Github className="w-4 h-4 shrink-0" />
                                GitHub
                            </button>
                        </div>

                        {/* Join link */}
                        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-[#219EBC] hover:text-[#1a7a94] font-semibold transition-colors">
                                Create one free
                            </Link>
                        </p>

                    </div>
                </div>

                {/* ───── RIGHT — Illustration ───── */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-[#d6eef5] to-[#c8e8f2] dark:from-[#0d1e35] dark:via-[#0f2440] dark:to-[#112a4a] transition-colors duration-300 p-6 relative overflow-hidden">

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#219EBC]/10 dark:bg-[#219EBC]/5 -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#219EBC]/10 dark:bg-[#219EBC]/5 translate-y-12 -translate-x-12" />

                    {/* Illustration */}
                    <div className="relative z-10 w-full max-w-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/secure-login.svg"
                            alt="Secure Login Illustration"
                            className="w-full h-auto object-contain drop-shadow-xl"
                            style={{ maxHeight: "calc(100vh - 14rem)" }}
                        />
                    </div>

                    {/* Caption */}
                    <div className="relative z-10 text-center mt-2">
                        <p className="text-sm font-bold text-[#219EBC] dark:text-[#4FC3F7]">
                            Secure & Encrypted
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Your data is always protected
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
