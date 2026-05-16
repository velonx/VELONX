import { prisma } from "@/lib/prisma";
import { VerificationType } from "@prisma/client"; 
import crypto from "crypto";

export const verificationService = {
  /**
   * Create a new verification record
   */
  async createVerification(data: {
    userId: string;
    type: VerificationType;
    title: string;
    description?: string;
    issuedAt?: Date;
    expiryDate?: Date;
    issuerId: string;
    metadata?: any;
  }) {
    // Generate a unique token for verification
    const verificationToken = crypto.randomBytes(16).toString("hex");

    return await prisma.verification.create({
      data: {
        ...data,
        verificationToken,
      },
    });
  },

  /**
   * Get a verification record by token
   */
  async getVerificationByToken(token: string) {
    return await prisma.verification.findUnique({
      where: { verificationToken: token },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },

  /**
   * Get all verifications (for admin)
   */
  async getAllVerifications() {
    return await prisma.verification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get verifications for a specific user
   */
  async getUserVerifications(userId: string) {
    return await prisma.verification.findMany({
      where: { userId },
      orderBy: {
        issuedAt: "desc",
      },
    });
  },

  /**
   * Delete a verification
   */
  async deleteVerification(id: string) {
    return await prisma.verification.delete({
      where: { id },
    });
  },
};
