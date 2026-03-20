"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      await authApi.forgotPassword({ email });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0f1624] px-4 font-outfit">
      <div className="w-full max-w-md bg-white dark:bg-[#131c2e] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-[#1e2d45]">
        
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#219EBC] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Reset Password</h1>
        
        {status === "success" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              If an account exists for <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>, a password reset link has been sent.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full bg-slate-100 dark:bg-[#1e2d45] hover:bg-slate-200 dark:hover:bg-[#2a3e5c] text-slate-700 dark:text-white font-bold rounded-xl py-3 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            {status === "error" && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 leading-tight">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2a3e5c] bg-slate-50 dark:bg-[#1e2d45] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#219EBC]/40 focus:border-[#219EBC] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center bg-[#219EBC] hover:bg-[#1a7a94] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition-all shadow-md shadow-[#219EBC]/20 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending rules...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
