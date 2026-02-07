import { z } from "zod";

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.array(z.string()).min(1, "At least one technology is required").max(20, "Tech stack cannot exceed 20 items"),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
  category: z.enum(["WEB_DEV", "MOBILE", "AI_ML", "DATA_SCIENCE", "DEVOPS", "DESIGN", "OTHER"]).default("OTHER"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional(),
  liveUrl: z.string().url("Invalid live URL").optional(),
  outcomes: z.string().optional(),
});

/**
 * Schema for updating a project
 */
export const updateProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  techStack: z.array(z.string()).min(1, "At least one technology is required").max(20, "Tech stack cannot exceed 20 items").optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
  category: z.enum(["WEB_DEV", "MOBILE", "AI_ML", "DATA_SCIENCE", "DEVOPS", "DESIGN", "OTHER"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional(),
  liveUrl: z.string().url("Invalid live URL").optional(),
  outcomes: z.string().optional(),
}).refine(
  (data) => {
    // If status is COMPLETED, outcomes should be provided
    if (data.status === "COMPLETED" && !data.outcomes) {
      return false;
    }
    return true;
  },
  {
    message: "Outcomes are required when marking a project as completed",
    path: ["outcomes"],
  }
);

/**
 * Schema for project query parameters (filtering)
 */
export const projectQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
  techStack: z.string().optional(), // Comma-separated list
  memberId: z.string().optional(), // Filter by member user ID
  category: z.enum(["WEB_DEV", "MOBILE", "AI_ML", "DATA_SCIENCE", "DEVOPS", "DESIGN", "OTHER"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

/**
 * Schema for adding a project member
 */
export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().max(100, "Role must not exceed 100 characters").optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
