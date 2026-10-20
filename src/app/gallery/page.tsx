import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Velonx",
  description: "Moments from Velonx hackathons, meetups, workshops and the community.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
