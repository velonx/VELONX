import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateCSRFToken } from '@/lib/middleware/csrf.middleware';
import { ReportCategory } from '@prisma/client';

const PAGE_SIZE_DEFAULT = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') || String(PAGE_SIZE_DEFAULT), 10));
    const skip = (page - 1) * pageSize;

    const isAdmin = (session.user as any).role === 'ADMIN';

    // Admins can see all reports; students see only their own
    const where = isAdmin ? {} : { userId: session.user.id };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('[Reports GET]', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch reports' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CSRF', message: 'Invalid or missing CSRF token' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, title, description, photoUrls, videoUrls } = body;

    // Validate required fields
    if (!category || !title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Category, title, and description are required' } },
        { status: 400 }
      );
    }

    // Validate category enum
    const validCategories = Object.values(ReportCategory);
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CATEGORY', message: `Category must be one of: ${validCategories.join(', ')}` } },
        { status: 400 }
      );
    }

    // Validate attachment limits
    if (Array.isArray(photoUrls) && photoUrls.length > 5) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_MANY_PHOTOS', message: 'Maximum 5 photos allowed per report' } },
        { status: 400 }
      );
    }
    if (Array.isArray(videoUrls) && videoUrls.length > 2) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_MANY_VIDEOS', message: 'Maximum 2 videos allowed per report' } },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        category: category as ReportCategory,
        title: title.trim(),
        description: description.trim(),
        photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
        videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report submitted successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Reports POST]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SUBMIT_FAILED', message: 'Failed to submit report' } },
      { status: 500 }
    );
  }
}
