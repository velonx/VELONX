import { z } from "zod";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must not exceed 100 characters").optional(),
  role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for updating a user profile
 */
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for user registration (signup)
 */
export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must not exceed 100 characters"),
});

/**
 * Schema for user login
 */
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Type exports for TypeScript
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
