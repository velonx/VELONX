import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { OpportunityService } from "@/lib/services/career.service";
import { opportunitySchema } from "@/lib/validations/career";
import { ZodError } from "zod";

// POST - Create opportunity (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = opportunitySchema.parse(body);

    const opportunity = await OpportunityService.create(validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: opportunity,
      message: "Opportunity created successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Opportunity creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create opportunity",
        },
      },
      { status: 500 }
    );
  }
}

// GET - Get all opportunities
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const statusParam = searchParams.get("status");

    // Admin can see all statuses, students only see ACTIVE
    const filters: any = { type };
    
    if (session?.user?.role === "ADMIN") {
      // If status is "all" or not provided, don't filter by status
      if (statusParam && statusParam !== "all") {
        filters.status = statusParam;
      }
    } else {
      // Non-admin users only see ACTIVE opportunities
      filters.status = "ACTIVE";
    }

    const opportunities = await OpportunityService.getAll(filters);

    return NextResponse.json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    console.error("Opportunity fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch opportunities",
        },
      },
      { status: 500 }
    );
  }
}
