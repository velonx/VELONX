import { Metadata } from "next";
import { redirect } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo.config";

export function generateMetadata(): Metadata {
  return generatePageMetadata(
    "Find a Mentor | Velonx",
    "Connect with experienced industry professionals and students. Get personalized guidance, resume reviews, and career advice to accelerate your tech journey.",
    "/mentors"
  );
}

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mentorship feature disabled for now — remove this redirect (and restore the
  // line below) to re-enable the page.
  redirect("/home");
  // return <>{children}</>;
}
