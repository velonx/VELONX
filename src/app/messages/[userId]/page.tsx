"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Mobile deep-link: /messages/[userId]
 * Redirects to main messages page with the userId pre-selected
 * For desktop, this just loads the messages page which handles the userId
 */
export default function DirectMessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to messages page — the main page handles conversation selection
    router.replace(`/messages?user=${userId}`);
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-background pt-28 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
