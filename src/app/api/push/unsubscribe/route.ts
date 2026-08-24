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
  const { endpoint } = body;

  if (!endpoint) {
    throw new ValidationError('Endpoint is required to unsubscribe');
  }

  const result = await pushNotificationService.removeSubscription(userId, endpoint);

  return NextResponse.json(
    {
      success: true,
      message: 'Push subscription removed successfully',
      data: result,
    },
    { status: 200 }
  );
});
