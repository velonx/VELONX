import { Metadata } from "next";
import EventsClient from "./EventsClient";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Live Events, Coding Sessions & Hackathons | Velonx",
  "Join live coding sessions, workshops, interactive hackathons, and community meetups. Level up your tech skills together with peer groups in Velonx.",
  "/events"
);

export default function EventsPage() {
  return <EventsClient />;
}
