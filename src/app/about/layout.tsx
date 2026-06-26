import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "About Velonx | Building the Next Generation of Tech Leaders",
  "Discover the mission, core values, and community impact of Velonx. Empowering students to build projects, find mentors, and launch tech careers.",
  "/about"
);

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
