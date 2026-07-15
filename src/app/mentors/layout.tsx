import { Metadata } from "next";
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
  return <>{children}</>;
}
