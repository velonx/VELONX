import { Metadata } from "next";
import BlogClient from "./BlogClient";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Velonx Insights | Tech Blog & Community Stories",
  "Explore the latest article publications, community case-studies, technical deep-dives, and career guidance inside the Velonx Insights blog.",
  "/blog"
);

export default function BlogPage() {
  return <BlogClient />;
}
