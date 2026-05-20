import { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Collaborative Tech Projects | Velonx",
  "Explore and join impactful student-led open-source and tech projects in the Velonx community. Build real-world solutions, collaborate with peers, and showcase your skills.",
  "/projects"
);

export default function ProjectsPage() {
  return <ProjectsClient />;
}
