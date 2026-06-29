import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRedisClient } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      geminiKeyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 7) + "..." : "none",
      hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    redis: { status: "not_tested", error: null },
    gemini: { status: "not_tested", error: null, response: null }
  };

  // 1. Test Redis
  try {
    const redis = getRedisClient();
    const pong = await redis.ping();
    diagnostics.redis.status = "success";
    diagnostics.redis.ping = pong;
  } catch (err: any) {
    diagnostics.redis.status = "failed";
    diagnostics.redis.error = err.message || err;
  }

  // 2. Test Gemini API
  if (process.env.GEMINI_API_KEY) {
    diagnostics.gemini = { models: {} };
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelCandidates = ["gemini-3.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    
    for (const mName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        const response = await model.generateContent("Respond with the word 'HELLO' and nothing else.");
        const text = response.response.text();
        diagnostics.gemini.models[mName] = {
          status: "success",
          response: text.trim()
        };
      } catch (err: any) {
        diagnostics.gemini.models[mName] = {
          status: "failed",
          error: err.message || err.toString()
        };
      }
    }
  } else {
    diagnostics.gemini = { status: "skipped", error: "No API key configured in environment" };
  }

  return NextResponse.json({ success: true, diagnostics });
}
