"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/client";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">(() => 
    (!token || !email) ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState(() => 
    (!token || !email) ? "Missing verification token or email." : ""
  );

  useEffect(() => {
    if (!token || !email) return;

    const verifyEmail = async () => {
      try {
        await authApi.verify({ token, email });
        
        setStatus("success");
        // Redirect to login after a few seconds
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-outfit">
      <div className="bg-white dark:bg-[#1A1916] p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-[#211F1B]">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#F0771A] animate-spin mb-4" />
            <h2 className="heading-card text-xl">Verifying...</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full" />
            <h2 className="heading-section text-2xl">Email Verified!</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
              Your email has been successfully verified. You will be redirected to the login page shortly.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold rounded-xl py-3 px-6 transition-all w-full shadow-md shadow-[#F0771A]/20"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="w-16 h-16 text-rose-500 mb-4 bg-rose-100 dark:bg-rose-900/30 rounded-full" />
            <h2 className="heading-section text-2xl">Verification Failed</h2>
            <p className="text-rose-600 dark:text-rose-400 mt-2 mb-6">
              {errorMessage}
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center border border-slate-200 dark:border-[#3A3833] hover:bg-slate-50 dark:hover:bg-[#211F1B] text-slate-700 dark:text-slate-300 font-bold rounded-xl py-3 px-6 transition-all w-full"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#F0771A]" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
