"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Mail, Lock, Eye, EyeOff, Github, ArrowRight, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

    useEffect(() => {
        // Read URL errors and post-login redirect target on mount
        const searchParams = new URLSearchParams(window.location.search);
        const requestedCallback = searchParams.get("callbackUrl");
        // Only honour same-origin relative paths to avoid open-redirects
        if (requestedCallback && requestedCallback.startsWith("/") && !requestedCallback.startsWith("//")) {
            setCallbackUrl(requestedCallback);
        }
        const error = searchParams.get("error");
        if (error === "OAuthAccountNotLinked") {
            queueMicrotask(() => setAuthError("An account with this email already exists. Please log in with the method you originally used to sign up."));
        } else if (error === "AccessDenied") {
            queueMicrotask(() => setAuthError("Access denied. You do not have permission to sign in."));
        } else if (error) {
            queueMicrotask(() => setAuthError("An error occurred during authentication."));
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated" && session?.user && !isRedirecting) {
            const dashboardPath = session.user.role === "ADMIN"
                ? "/dashboard/admin"
                : (callbackUrl ?? "/home");
            router.push(dashboardPath);
        }
    }, [status, session, router, isRedirecting, callbackUrl]);

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
                const destination = role === "admin" ? "/dashboard/admin" : (callbackUrl ?? "/home");
                router.push(destination);
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
            await signIn("google", { callbackUrl: callbackUrl ?? "/home" });
        } catch {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        try {
            await signIn("github", { callbackUrl: callbackUrl ?? "/home" });
        } catch {
            setLoading(false);
        }
    };

    return (
        /* Full viewport split — image is edge-to-edge, form side clears the floating navbar via pt-20 */
        <div className="h-screen overflow-hidden flex bg-background font-outfit transition-colors duration-300">

            {/* Split */}
            <div className="w-full h-full flex">

                {/* ───── LEFT — Form ───── */}
                <div className="flex-1 flex flex-col justify-center px-8 py-6 pt-20 bg-white dark:bg-[#1A1916] transition-colors duration-300 overflow-y-auto">
                    <div className="w-full max-w-xs mx-auto">

                        {/* Brand */}
                        <div className="mb-5">
                            <span className="text-2xl font-black tracking-tight bg-linear-to-r from-[#F0771A] via-[#FFA800] to-[#E9C46A] bg-clip-text text-transparent">
                                Velonx
                            </span>
                            <h1 className="mt-3 heading-section text-2xl leading-tight">
                                Welcome back <span className="align-middle">👋</span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Sign in to continue your learning journey and access amazing opportunities.
                            </p>
                        </div>

                        {/* Error Banner */}
                        {authError && (
                            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 flex items-start gap-2.5 animate-in fade-in zoom-in duration-300">
                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                                    {authError}
                                </p>
                            </div>
                        )}

                        {/* Tabs — Student / Admin */}
                        <Tabs defaultValue="student" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-5 bg-slate-100 dark:bg-[#211F1B] p-1 rounded-xl border border-slate-200 dark:border-[#3A3833]">
                                <TabsTrigger
                                    value="student"
                                    className="rounded-lg py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#F0771A] data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all gap-1.5"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Student
                                </TabsTrigger>
                                <TabsTrigger
                                    value="admin"
                                    className="rounded-lg py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#F0771A] data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all gap-1.5"
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
                                                    placeholder={role === "student" ? "student@example.com" : "admin@velonx.in"}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#3A3833] bg-slate-50 dark:bg-[#211F1B] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F0771A]/40 focus:border-[#F0771A] transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    Password
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#3A3833] bg-slate-50 dark:bg-[#211F1B] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F0771A]/40 focus:border-[#F0771A] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <div className="flex justify-end mt-1.5 pt-1">
                                                <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#F0771A] hover:text-[#e0650d] transition-colors">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Remember me */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="remember-me"
                                                className="w-3.5 h-3.5 rounded accent-[#F0771A] cursor-pointer"
                                            />
                                            <label htmlFor="remember-me" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                                Keep me signed in
                                            </label>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#F0771A] to-[#e0650d] hover:from-[#e0650d] hover:to-[#c85a0a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl py-2.5 transition-all duration-200 shadow-md shadow-[#F0771A]/20 mt-1 group"
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
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#3A3833]" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">or continue with</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#3A3833]" />
                        </div>

                        {/* Social Logins */}
                        <div className="flex items-center gap-3">
                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#3A3833] bg-white dark:bg-[#211F1B] hover:bg-slate-50 dark:hover:bg-[#2A2824] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
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
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#3A3833] bg-white dark:bg-[#211F1B] hover:bg-slate-50 dark:hover:bg-[#2A2824] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                                aria-label="Sign in with GitHub"
                            >
                                <Github className="w-4 h-4 shrink-0" />
                                GitHub
                            </button>
                        </div>

                        {/* Join link */}
                        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-[#F0771A] hover:text-[#e0650d] font-semibold transition-colors">
                                Create one free
                            </Link>
                        </p>

                    </div>
                </div>

                {/* ───── RIGHT — Full-bleed Illustration ───── */}
                <div className="hidden md:block relative flex-1 h-full bg-linear-to-br from-[#faf3ea] via-[#f5e9d8] to-[#f0e0cc] dark:from-[#1A1916] dark:via-[#211F1B] dark:to-[#2A2824] transition-colors duration-300 overflow-hidden">
                    <Image
                        src="https://res.cloudinary.com/dypbafujn/image/upload/v1785460335/login_u5w9l6.png"
                        alt="Students building projects together on Velonx"
                        fill
                        priority
                        sizes="(min-width: 768px) 50vw, 0px"
                        className="object-cover object-center"
                    />
                </div>

            </div>
        </div>
    );
}
