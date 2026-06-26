import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Contact Us | Get in Touch with Velonx",
  "Have questions or want to partner with Velonx? Contact our team for support, partnerships, or general inquiries.",
  "/contact"
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
