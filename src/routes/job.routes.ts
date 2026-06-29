import { Router } from "express";
import { getRedisClient } from "../lib/redis";
import { prisma } from "../lib/prisma";

const authMiddleware = (req: any, res: any, next: any) => next();

const router = Router();

router.patch("/job/:jobId", authMiddleware, async (req: any, res: any) => {
  try {
    const { jobId } = req.params;
    const body = req.body;
    
    const updatedJob = await prisma.opportunity.update({
      where: { id: jobId },
      data: body
    });

    // Delete all AI match cache for this job
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(`match:*:${jobId}`);
    if (keys.length > 0) await redisClient.del(...keys);

    return res.json({ success: true, data: updatedJob });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
