import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { withErrorHandler } from '@/lib/utils/errors';
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
  const { title, body: notificationBody, actionUrl } = body;

  const result = await pushNotificationService.sendPushToUser(userId, {
    title: title || '🔔 VELONX Browser Notification',
    body: notificationBody || 'Desktop & Mobile notifications are successfully active on your browser!',
    actionUrl: actionUrl || '/notifications',
    tag: 'velonx-test',
    requireInteraction: true,
    vibrate: [200, 100, 200],
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Test notification dispatched',
      data: result,
    },
    { status: 200 }
  );
});
