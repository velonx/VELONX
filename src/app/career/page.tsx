import CareerClient from "./CareerClient";
import { OpportunityService } from "@/lib/services/career.service";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  let initialInternships: any[] = [];
  let initialJobs: any[] = [];

  try {
    const internships = await OpportunityService.getAll({
      type: "INTERNSHIP",
      status: { in: ["ACTIVE", "CLOSED"] } as any,
    });
    // Serialize Dates to Strings to avoid NextJS serialization/hydration warnings
    initialInternships = JSON.parse(JSON.stringify(internships));
  } catch (error) {
    console.error("Failed to fetch initial internships on server:", error);
  }

  try {
    const jobs = await OpportunityService.getAll({
      type: "JOB",
      status: { in: ["ACTIVE", "CLOSED"] } as any,
    });
    // Serialize Dates to Strings to avoid NextJS serialization/hydration warnings
    initialJobs = JSON.parse(JSON.stringify(jobs));
  } catch (error) {
    console.error("Failed to fetch initial jobs on server:", error);
  }

  return (
    <CareerClient
      initialInternships={initialInternships}
      initialJobs={initialJobs}
    />
  );
}
