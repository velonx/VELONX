import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users/export
 * Exports all users as a CSV file
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate that the caller is an Admin
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    // 2. Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        xp: true,
        level: true,
        referralCode: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Generate CSV content
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Email Verified",
      "Provider",
      "XP",
      "Level",
      "Referral Code",
      "Created At"
    ];

    const escapeCsvValue = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = users.map((user) => [
      user.id,
      user.name || "",
      user.email,
      user.role,
      user.emailVerified ? "Yes" : "No",
      user.accounts.map((a) => a.provider).join(", ") || "credentials",
      user.xp,
      user.level,
      user.referralCode || "",
      user.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(","))
    ].join("\n");

    // 4. Return as CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=users-export.csv",
      },
    });
  } catch (error) {
    console.error("[ADMIN_USERS_EXPORT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
