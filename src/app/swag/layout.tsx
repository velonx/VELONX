import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Velonx Swag Store | Redeem Your XP",
  "Exclusive premium merchandise for the Velonx community. Turn your hard-earned XP into notebooks, bottles, apparel, and more.",
  "/swag",
  "/swag-hero-light.webp"
);

export default function SwagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
