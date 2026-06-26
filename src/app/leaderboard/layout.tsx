import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Student Leaderboard | Velonx Gamified Learning",
  "Celebrate student achievements, view community XP rankings, levels, active learning streaks, and track peer progress.",
  "/leaderboard"
);

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
