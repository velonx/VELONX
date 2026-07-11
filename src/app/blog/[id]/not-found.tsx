import Link from "next/link";
import { ArrowLeft, FileX } from "lucide-react";

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileX className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Article Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          This article may have been moved, removed, or the URL might be
          incorrect. Check out our other articles below.
        </p>
        <Link
          href="/blog"
          className="btn-redesign btn-redesign-primary text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Browse All Articles
        </Link>
      </div>
    </div>
  );
}
