import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ success: false, error: "Missing token or email" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ success: false, error: "Token expired" }, { status: 400 });
    }

    // Update user and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
