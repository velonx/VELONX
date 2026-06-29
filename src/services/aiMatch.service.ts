import { getRedisClient } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface MatchResult {
  score: number;
  verdict: "Strong Match" | "Good Match" | "Partial Match" | "Low Match" | "Unable to score";
  strengths: string[];
  gaps: string[];
  tip: string;
}

const fallbackResult: MatchResult = {
  score: 0,
  verdict: "Unable to score",
  strengths: [],
  gaps: [],
  tip: "Please try again in a moment."
};

/**
 * Evaluates how well the candidate matches the job post.
 */
export async function matchUserToJob(userProfile: any, jobPost: any): Promise<MatchResult> {
  if (!userProfile || !jobPost) {
    return fallbackResult;
  }

  const userId = userProfile.id || userProfile._id?.toString();
  const jobId = jobPost.id || jobPost._id?.toString();
  
  if (!userId || !jobId) {
    return fallbackResult;
  }

  const redisKey = `match:${userId}:${jobId}`;

  // 1. Check cache first
  try {
    const redis = getRedisClient();
    const cached = await redis.get<any>(redisKey);
    if (cached) {
      if (typeof cached === "string") {
        return JSON.parse(cached);
      }
      return cached as MatchResult;
    }
  } catch (redisError) {
    console.error(`[Redis Error] Failed to get key ${redisKey}:`, redisError);
  }

  // 2. Call Gemini API
  try {
    if (!apiKey) {
      console.warn("[aiMatch.service] GEMINI_API_KEY is not set. Returning fallback.");
      return fallbackResult;
    }

    const name = userProfile.name || "Candidate";
    const skills = Array.isArray(userProfile.skills) ? userProfile.skills.join(", ") : "";
    const education = userProfile.college ? `${userProfile.college} (Graduation: ${userProfile.graduationYear || 'N/A'})` : "";
    const experience = userProfile.bio || "Fresher";
    
    // Extract project titles
    let projects = "";
    if (Array.isArray(userProfile.projectsOwned)) {
      projects = userProfile.projectsOwned.map((p: any) => `${p.title}: ${p.description || ''}`).join("; ");
    } else if (Array.isArray(userProfile.projects)) {
      projects = userProfile.projects.join("; ");
    }

    // Resume section: use extracted text if available; fallback to profile fields only
    const hasResumeText = !!userProfile.resumeText && userProfile.resumeText.trim().length > 20;
    const resumeSection = hasResumeText
      ? `- Resume Content (extracted from PDF):\n${userProfile.resumeText.trim()}`
      : `- Resume: ${userProfile.resumeUrl ? `PDF on file (text not yet extracted): ${userProfile.resumeUrl}` : 'Not uploaded — score based on profile fields only'}`;

    const title = jobPost.title || "";
    const company = jobPost.company || "";
    const location = jobPost.location || "";
    const roleType = jobPost.type ? jobPost.type.toLowerCase() : "job";
    const requiredSkills = Array.isArray(jobPost.requirements) ? jobPost.requirements.join(", ") : "";
    const experienceRequired = Array.isArray(jobPost.requirements) 
      ? jobPost.requirements.find((r: string) => r.toLowerCase().includes("exp") || r.toLowerCase().includes("year")) || "Fresher / 0-1 years"
      : "Fresher / 0-1 years";
    const description = jobPost.description || "";

    const prompt = `You are an expert hiring assistant for a job platform in India that focuses on freshers and early-career candidates.

You will be given a candidate's profile and a job post. Your job is to evaluate how well the candidate matches the role.

Be realistic and honest. A fresher with basic skills should not get 90+ unless the job explicitly requires only basics. Penalize meaningfully for missing critical required skills.

CANDIDATE PROFILE:
- Name: ${name}
- Skills: ${skills}
- Education: ${education}
- Experience: ${experience}
- Projects: ${projects}
${resumeSection}

JOB POST:
- Role: ${title} at ${company}
- Location: ${location}
- Type: ${roleType}
- Required Skills: ${requiredSkills}
- Experience Required: ${experienceRequired}
- Description: ${description}

${hasResumeText ? 'Use the full resume content above as the PRIMARY source for evaluating skills, experience, and projects. Profile fields are secondary context.' : 'No resume text is available. Score based on profile fields only.'}

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text. Just the raw JSON.

{
  "score": <integer from 0 to 100>,
  "verdict": "<exactly one of: Strong Match, Good Match, Partial Match, Low Match>",
  "strengths": ["<string>", "<string>"],
  "gaps": ["<string>", "<string>"],
  "tip": "<one short actionable sentence the candidate can do to improve their chances for this specific role>"
}

Rules:
- score 80-100 = Strong Match
- score 60-79 = Good Match
- score 40-59 = Partial Match
- score 0-39 = Low Match
- strengths: maximum 3 items, minimum 1
- gaps: maximum 3 items. If no gaps, return empty array []
- tip: must be specific to this job, not generic advice`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    let cleanJson = text.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    const parsed: MatchResult = JSON.parse(cleanJson);
    
    if (typeof parsed.score !== "number" || !parsed.verdict || !Array.isArray(parsed.strengths) || !Array.isArray(parsed.gaps) || !parsed.tip) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Cache the result for 24 hours
    try {
      const redis = getRedisClient();
      await redis.set(redisKey, JSON.stringify(parsed), { ex: 86400 });
    } catch (redisError) {
      console.error(`[Redis Error] Failed to cache result for ${redisKey}:`, redisError);
    }

    return parsed;
  } catch (error) {
    console.error(`[aiMatch.service] Error evaluating match:`, error);
    return fallbackResult;
  }
}

/**
 * Matches a user profile against an array of job posts, returning them sorted by match score descending.
 */
export async function getRecommendedJobs(userProfile: any, jobsArray: any[]): Promise<any[]> {
  try {
    let filteredJobs = jobsArray;
    if (userProfile && userProfile.lookingFor) {
      const lf = userProfile.lookingFor.toUpperCase();
      if (lf === "INTERNSHIP") {
        filteredJobs = jobsArray.filter(j => j.type === "INTERNSHIP");
      } else if (lf === "JOB") {
        filteredJobs = jobsArray.filter(j => j.type === "JOB");
      }
    }

    const matchedJobs = await Promise.all(
      filteredJobs.map(async (job) => {
        const matchResult = await matchUserToJob(userProfile, job);
        const jobObj = typeof job.toObject === "function" ? job.toObject() : { ...job };
        return {
          ...jobObj,
          aiScore: matchResult.score,
          verdict: matchResult.verdict
        };
      })
    );

    return matchedJobs.sort((a, b) => b.aiScore - a.aiScore);
  } catch (error) {
    console.error("[aiMatch.service] getRecommendedJobs failed:", error);
    return jobsArray.map((job) => {
      const jobObj = typeof job.toObject === "function" ? job.toObject() : { ...job };
      return {
        ...jobObj,
        aiScore: 0,
        verdict: "Unable to score"
      };
    });
  }
}
