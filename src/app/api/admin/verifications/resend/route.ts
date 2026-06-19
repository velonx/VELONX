import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { EmailService } from "@/lib/services/email.service";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/admin/verifications/resend
 * Resend email verification link to an unverified user
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate that the caller is an Admin
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    // 2. Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // 3. Find user and make sure they are unverified and registered via credentials
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 444 } // using 404 for not found
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "User is already verified" },
        { status: 400 }
      );
    }

    if (user.accounts.length > 0) {
      return NextResponse.json(
        { success: false, error: "User signed up with Google/GitHub and does not need email verification" },
        { status: 400 }
      );
    }

    // 4. Generate new verification token and delete old ones
    const token = crypto.randomBytes(32).toString("hex");
    
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { identifier: email },
      }),
      prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      }),
    ]);

    // 5. Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    
    await EmailService.sendVerificationEmail(
      { email, name: user.name },
      verificationUrl
    );

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
