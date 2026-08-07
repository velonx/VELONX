import { Suspense } from "react";
import CareerClient from "./CareerClient";
import { OpportunityService } from "@/lib/services/career.service";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  let initialInternships: any[] = [];
  let initialJobs: any[] = [];
  let closedInternships: any[] = [];
  let closedJobs: any[] = [];

  try {
    // Fetch ACTIVE internships (what visitors should see first)
    const activeInterns = await OpportunityService.getAll({
      type: "INTERNSHIP",
      status: "ACTIVE",
    });
    initialInternships = JSON.parse(JSON.stringify(activeInterns));
  } catch (error) {
    console.error("Failed to fetch active internships on server:", error);
  }

  try {
    // Fetch CLOSED internships separately (collapsed by default on client)
    const closedInterns = await OpportunityService.getAll({
      type: "INTERNSHIP",
      status: "CLOSED",
    });
    closedInternships = JSON.parse(JSON.stringify(closedInterns));
  } catch (error) {
    console.error("Failed to fetch closed internships on server:", error);
  }

  try {
    // Fetch ACTIVE jobs
    const activeJobs = await OpportunityService.getAll({
      type: "JOB",
      status: "ACTIVE",
    });
    initialJobs = JSON.parse(JSON.stringify(activeJobs));
  } catch (error) {
    console.error("Failed to fetch active jobs on server:", error);
  }

  try {
    // Fetch CLOSED jobs separately
    const closedJobsList = await OpportunityService.getAll({
      type: "JOB",
      status: "CLOSED",
    });
    closedJobs = JSON.parse(JSON.stringify(closedJobsList));
  } catch (error) {
    console.error("Failed to fetch closed jobs on server:", error);
  }

  return (
    <Suspense fallback={null}>
      <CareerClient
        initialInternships={initialInternships}
        initialJobs={initialJobs}
        initialClosedInternships={closedInternships}
        initialClosedJobs={closedJobs}
      />
    </Suspense>
  );
}

