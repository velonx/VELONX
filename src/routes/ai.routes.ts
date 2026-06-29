import { Router } from "express";
import { matchUserToJob, getRecommendedJobs } from "../services/aiMatch.service";
import { prisma } from "../lib/prisma";

// Dummy authMiddleware to simulate session attachments
const authMiddleware = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const router = Router();

// GET /api/ai/match/:jobId
router.get("/match/:jobId", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const job = await prisma.opportunity.findUnique({
      where: { id: jobId }
    });

    if (!user || !job) {
      return res.status(404).json({ error: "Not found" });
    }

    const result = await matchUserToJob(user, job);
    return res.json(result);
  } catch (error) {
    console.error("Express /match/:jobId error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/ai/recommendations
router.get("/recommendations", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const filter: any = { status: "ACTIVE" };
    if (user.lookingFor) {
      const lf = user.lookingFor.toUpperCase();
      if (lf === "INTERNSHIP") {
        filter.type = "INTERNSHIP";
      } else if (lf === "JOB") {
        filter.type = "JOB";
      }
    }

    const jobs = await prisma.opportunity.findMany({
      where: filter,
      take: 50
    });

    const results = await getRecommendedJobs(user, jobs);
    return res.json(results);
  } catch (error) {
    console.error("Express /recommendations error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/ai/search
router.get("/search", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const filter: any = { status: "ACTIVE" };
    if (user.lookingFor) {
      const lf = user.lookingFor.toUpperCase();
      if (lf === "INTERNSHIP") {
        filter.type = "INTERNSHIP";
      } else if (lf === "JOB") {
        filter.type = "JOB";
      }
    }

    const jobs = await prisma.opportunity.findMany({
      where: filter
    });

    const queryLower = q.toLowerCase();
    const matchingJobs = jobs.filter(job => 
      job.title.toLowerCase().includes(queryLower) ||
      job.requirements.some(req => req.toLowerCase().includes(queryLower))
    );

    const results = await getRecommendedJobs(user, matchingJobs);
    return res.json(results);
  } catch (error) {
    console.error("Express /search error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
