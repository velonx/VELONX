import { Router } from "express";
import { getRedisClient } from "../lib/redis";
import { prisma } from "../lib/prisma";

const authMiddleware = (req: any, res: any, next: any) => next();

const router = Router();

router.patch("/profile", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const body = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body
    });

    // Delete all AI match cache for this user
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(`match:${userId}:*`);
    if (keys.length > 0) await redisClient.del(...keys);

    return res.json({ success: true, data: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
