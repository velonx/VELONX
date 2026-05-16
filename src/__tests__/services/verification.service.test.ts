import { describe, it, expect, vi, beforeEach } from "vitest";
import { verificationService } from "@/lib/services/verification.service"; 
import { prisma } from "@/lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    verification: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("VerificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a verification with a unique token", async () => {
    const mockData = {
      userId: "user-123",
      type: "INTERNSHIP" as const,
      title: "Full Stack Internship",
      description: "Test description",
      issuerId: "admin-456",
    };

    (prisma.verification.create as any).mockResolvedValue({
      id: "ver-1",
      ...mockData,
      verificationToken: "mock-token",
    });

    const result = await verificationService.createVerification(mockData);

    expect(prisma.verification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockData.userId,
        type: mockData.type,
        title: mockData.title,
        verificationToken: expect.any(String),
      }),
    });
    expect(result.verificationToken).toBe("mock-token");
  });

  it("should find a verification by token", async () => {
    const mockVerification = {
      id: "ver-1",
      verificationToken: "token-123",
      title: "Achievement",
      user: { name: "John Doe" },
    };

    (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);

    const result = await verificationService.getVerificationByToken("token-123");

    expect(prisma.verification.findUnique).toHaveBeenCalledWith({
      where: { verificationToken: "token-123" },
      include: expect.any(Object),
    });
    expect(result).toEqual(mockVerification);
  });
});
