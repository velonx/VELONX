import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Developer Network | Velonx",
  "Discover and connect with student developers on Velonx. Browse profiles by skills, college, and location, then grow your network.",
  "/network"
);

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
