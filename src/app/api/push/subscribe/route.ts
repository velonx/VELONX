import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { withErrorHandler, ValidationError } from '@/lib/utils/errors';
import { pushNotificationService } from '@/lib/services/push-notification.service';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const { subscription, userAgent } = body;

  if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new ValidationError('Invalid push subscription: endpoint and keys are required');
  }

  const saved = await pushNotificationService.saveSubscription(
    userId,
    subscription,
    userAgent || req.headers.get('user-agent') || undefined
  );

  return NextResponse.json(
    {
      success: true,
      message: 'Push subscription registered successfully',
      data: {
        id: saved.id,
        endpoint: saved.endpoint,
      },
    },
    { status: 201 }
  );
});
