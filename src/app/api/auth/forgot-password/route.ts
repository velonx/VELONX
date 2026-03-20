import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { EmailService } from "@/lib/services/email.service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const identifier = `RESET_${email}`;

    // Delete existing reset tokens for this email to prevent spam
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // Save new token
    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour expiration
      },
    });

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    await EmailService.sendPasswordResetEmail(
      { email: user.email, name: user.name },
      resetUrl
    ).catch(e => console.error("Failed to send password reset email:", e));

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
