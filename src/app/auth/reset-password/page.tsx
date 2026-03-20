"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isInvalidLink = !token || !email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidLink) return;

    if (password.length < 6) {
      setStatus("error");
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (isInvalidLink) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-[#131c2e] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-[#1e2d45] text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Invalid Link</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl py-3 transition-colors shadow-md shadow-[#219EBC]/20"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#131c2e] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-[#1e2d45]">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Create New Password</h1>

      {status === "success" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Password Reset Successful!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your password has been successfully updated.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl py-3 transition-colors shadow-md shadow-[#219EBC]/20"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Please enter your new password below.
          </p>

          {status === "error" && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full flex items-center justify-center bg-[#219EBC] hover:bg-[#1a7a94] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition-all shadow-md shadow-[#219EBC]/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0f1624] px-4 font-outfit">
      <Suspense fallback={<div className="flex flex-col items-center"><Loader2 className="w-12 h-12 text-[#219EBC] animate-spin mb-4" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
