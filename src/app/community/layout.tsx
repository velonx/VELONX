import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Developer Community | Velonx Connect",
  "Connect with like-minded developers, join focus groups, ask questions, share insights, and grow together inside the Velonx community.",
  "/community"
);

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
