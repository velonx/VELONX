import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { handleError } from "@/lib/utils/errors";
import { generateReferralCode, validateReferralCode, createReferralRelationship } from "@/lib/services/referral.service";
import crypto from "crypto";
import { EmailService } from "@/lib/services/email.service";

// Signup validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "ADMIN"]).optional().default("STUDENT"),
  referralCode: z.string().optional(),
});

/**
 * POST /api/auth/signup
 * Create a new user account
 * Public endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Generate unique referral code for new user
    const referralCode = await generateReferralCode();

    // Validate referral code if provided
    let referrerId: string | undefined;
    if (validatedData.referralCode) {
      const validation = await validateReferralCode(validatedData.referralCode);
      if (validation.valid && validation.referrerId) {
        referrerId = validation.referrerId;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role, // Use provided role or default to STUDENT
        referralCode, // Assign generated referral code
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create referral relationship if valid referral code was provided
    if (referrerId && referrerId !== user.id) {
      try {
        await createReferralRelationship(referrerId, user.id);
      } catch (error) {
        // Log error but don't fail registration
        console.error('Failed to create referral relationship:', error);
      }
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(user.email)}`;
    await EmailService.sendVerificationEmail(
      { email: user.email, name: user.name },
      verificationUrl
    ).catch(e => console.error("Failed to send verification email:", e));

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
