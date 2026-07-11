"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t load this article right now. This might be a
          temporary issue — please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="btn-redesign btn-redesign-primary text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full"
          >
            Try Again
          </button>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
