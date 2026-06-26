import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Apply as a Mentor | Velonx Mentorship",
  "Share your industry expertise and guide the next generation of developers. Apply to become a verified mentor on Velonx.",
  "/apply-mentor"
);

export default function ApplyMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
