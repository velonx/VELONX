import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Opportunities Hub | Velonx Placements",
  "Explore vetted internship and entry-level career opportunities with verified stipends and fair, skill-first selection rounds in Velonx.",
  "/career"
);

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
