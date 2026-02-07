import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

/**
 * Middleware to require authentication for API routes
 * Returns the session if authenticated, or an error response if not
 */
export async function requireAuth(): Promise<Session | NextResponse> {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }
    
    return session;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      { status: 401 }
    );
  }
}

/**
 * Middleware to require admin role for API routes
 * Returns the session if user is admin, or an error response if not
 */
export async function requireAdmin(): Promise<Session | NextResponse> {
  const sessionOrResponse = await requireAuth();
  
  // If requireAuth returned an error response, pass it through
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  
  const session = sessionOrResponse;
  
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      },
      { status: 403 }
    );
  }
  
  return session;
}

/**
 * Middleware to check if the authenticated user is the resource owner or an admin
 * Returns the session if authorized, or an error response if not
 */
export async function requireOwnerOrAdmin(
  resourceOwnerId: string
): Promise<Session | NextResponse> {
  const sessionOrResponse = await requireAuth();
  
  // If requireAuth returned an error response, pass it through
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  
  const session = sessionOrResponse;
  
  if (session.user.id !== resourceOwnerId && session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        },
      },
      { status: 403 }
    );
  }
  
  return session;
}
