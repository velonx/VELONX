import { NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/services/push-notification.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const publicKey = pushNotificationService.getPublicKey();

  return NextResponse.json(
    {
      success: true,
      data: {
        publicKey,
      },
    },
    { status: 200 }
  );
}
