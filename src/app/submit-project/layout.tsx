import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Submit Your Project | Velonx Showcase",
  "Showcase your tech project to the Velonx community, receive feedback from peers, and gain recognition for your build.",
  "/submit-project"
);

export default function SubmitProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
