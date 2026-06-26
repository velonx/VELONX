import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Privacy Policy | Velonx",
  "Understand how Velonx handles and protects your personal data and privacy.",
  "/privacy"
);

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
