import { mentorService } from "@/lib/services/mentor.service";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialMentors: any[] = [];
  try {
    const result = await mentorService.listMentors({
      pageSize: 4,
      page: 1,
    });
    // Serialize dates or dynamic fields to prevent nextjs hydration / serialization warnings
    initialMentors = JSON.parse(JSON.stringify(result.mentors || []));
  } catch (error) {
    console.error("Failed to fetch initial mentors on server:", error);
  }

  return <HomeClient initialMentors={initialMentors} />;
}
