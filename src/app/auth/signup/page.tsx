"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Rocket, Mail, Lock, User, Eye, EyeOff, Gift, Github } from "lucide-react";
import { authApi } from "@/lib/api/client";

export default function SignupPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-100 dark:bg-[#0f1624] flex items-center justify-center">
                <div className="text-center">
                    <Rocket className="w-16 h-16 mx-auto mb-4 animate-pulse text-[#219EBC]" />
                    <p className="text-lg text-slate-500 dark:text-slate-400">Loading signup...</p>
                </div>
            </div>
        }>
            <SignupPage />
        </Suspense>
    );
}

function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [referralCodeError, setReferralCodeError] = useState<string | null>(null);
    const [referralCodeValidating, setReferralCodeValidating] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReferralCode(refParam);
            validateReferralCodeAsync(refParam);
        }
    }, [searchParams]);

    const handleFieldChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (error) setError(null);
    };

    const validateReferralCodeAsync = async (code: string) => {
        if (!code || code.trim() === "") { setReferralCodeError(null); return; }
        setReferralCodeValidating(true);
        setReferralCodeError(null);
        try {
            const response = await fetch('/api/referral/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });
            const result = await response.json();
            if (!(result.success && result.data.valid)) {
                setReferralCodeError("Invalid referral code. You can still register without one.");
            }
        } catch (err) {
            console.error("Referral code validation error:", err);
            setReferralCodeError("Unable to validate referral code. You can still register.");
        } finally {
            setReferralCodeValidating(false);
        }
    };

    const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReferralCode(e.target.value);
        if (error) setError(null);
        setReferralCodeError(null);
    };

    const handleReferralCodeBlur = () => {
        if (referralCode.trim()) validateReferralCodeAsync(referralCode.trim());
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

        setLoading(true);
        try {
            const fullName = `${firstName} ${lastName}`.trim();
            const signupData: { name: string; email: string; password: string; role: "STUDENT" | "ADMIN"; referralCode?: string } = { name: fullName, email, password, role: "STUDENT" };
            if (referralCode.trim()) signupData.referralCode = referralCode.trim();

            await authApi.signup(signupData);
            setVerificationSent(true);
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === "USER_EXISTS") setError("An account with this email already exists");
            else if (err.message) setError(err.message);
            else setError("Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try { await signIn("google", { callbackUrl: "/dashboard/student" }); }
        catch (error) { console.error("Google signup error:", error); setLoading(false); }
    };

    const handleGitHubSignup = async () => {
        setLoading(true);
        try { await signIn("github", { callbackUrl: "/dashboard/student" }); }
        catch (error) { console.error("GitHub signup error:", error); setLoading(false); }
    };

    return (
        <div className="h-screen overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#0f1624] font-outfit transition-colors duration-300 pt-20 pb-4 px-4">

            {/* Card */}
            <div className="w-full max-w-5xl h-full max-h-[calc(100vh-6rem)] flex rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1e2d45]">

                {/* ───── LEFT — Form ───── */}
                <div className="flex-1 flex flex-col justify-center px-8 py-6 bg-white dark:bg-[#131c2e] transition-colors duration-300 overflow-y-auto">
                    <div className="w-full max-w-xs mx-auto">

                        {/* Brand */}
                        <div className="mb-4">
                            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] bg-clip-text text-transparent">
                                Velonx
                            </span>
                            <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                                Create account
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Start your innovation journey today
                            </p>
                        </div>

                        {verificationSent ? (
                            <div className="text-center py-8 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your email</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    We've sent a verification link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Please click the link to verify your account.
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                                    Once verified, you can {" "}
                                    <Link href="/auth/login" className="text-[#219EBC] hover:underline font-semibold transition-colors">
                                        sign in
                                    </Link>
                                    {" "}to continue.
                                </p>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSignup} className="space-y-3">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2 text-red-600 dark:text-red-400 text-xs">
                                    {error}
                                </div>
                            )}

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={handleFieldChange(setFirstName)}
                                            required
                                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={handleFieldChange(setLastName)}
                                            required
                                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={handleFieldChange(setEmail)}
                                        required
                                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={handleFieldChange(setPassword)}
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
                            </div>

                            {/* Referral Code */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Referral Code <span className="font-normal text-slate-400">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter referral code"
                                        value={referralCode}
                                        onChange={handleReferralCodeChange}
                                        onBlur={handleReferralCodeBlur}
                                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all ${referralCodeError ? 'border-yellow-400 dark:border-yellow-500' : 'border-slate-200 dark:border-[#2a3e5c]'}`}
                                    />
                                    {referralCodeValidating && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {referralCodeError && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{referralCodeError}</p>}
                                {referralCode && !referralCodeError && !referralCodeValidating && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Valid referral code</p>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded accent-[#219EBC] cursor-pointer mt-0.5"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-tight cursor-pointer select-none">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-[#219EBC] hover:text-[#1a7a94] transition-colors">Terms of Service</Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" className="text-[#219EBC] hover:text-[#1a7a94] transition-colors">Privacy Policy</Link>
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
                                        Creating Account...
                                    </span>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#2a3e5c]" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">or sign up with</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-[#2a3e5c]" />
                        </div>

                        {/* Social Logins */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-white dark:bg-[#1e2d45] hover:bg-slate-50 dark:hover:bg-[#243349] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                                aria-label="Sign up with Google"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={handleGitHubSignup}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-white dark:bg-[#1e2d45] hover:bg-slate-50 dark:hover:bg-[#243349] transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                                aria-label="Sign up with GitHub"
                            >
                                <Github className="w-4 h-4 shrink-0" />
                                GitHub
                            </button>
                        </div>

                            </>
                        )}

                    </div>
                </div>

                {/* ───── RIGHT — Illustration ───── */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#fdf9f0] via-[#faf5e8] to-[#f5eedd] dark:from-[#1a1810] dark:via-[#1c1a12] dark:to-[#1e1c14] transition-colors duration-300 p-6 relative overflow-hidden">

                    {/* Decorative circles matching gold/yellow theme */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#E9C46A]/10 dark:bg-[#E9C46A]/5 -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#E9C46A]/10 dark:bg-[#E9C46A]/5 translate-y-12 -translate-x-12" />

                    {/* Illustration */}
                    <div className="relative z-10 w-full max-w-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/signup-illustration.png"
                            alt="Secure Signup Illustration"
                            className="w-full h-auto object-contain drop-shadow-xl"
                            style={{ maxHeight: "calc(100vh - 14rem)" }}
                        />
                    </div>

                    {/* Caption */}
                    <div className="relative z-10 text-center mt-2">
                        <p className="text-sm font-bold text-[#d4a843] dark:text-[#E9C46A]">
                            Join the Community
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Build real projects with expert guidance
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
