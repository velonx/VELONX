import { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Learning Resources & Student Guides | Velonx",
  "Access curated tutorials, courses, templates, and tools to accelerate your learning. Level up your coding, design, and product building skills with Velonx.",
  "/resources"
);

export default function ResourcesPage() {
  return <ResourcesClient />;
}
