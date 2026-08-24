import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/utils/errors';

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actionUrl?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: Array<{ action: string; title: string }>;
}

// Lazy-load or dynamically generate runtime keys if not provided in environment variables
let runtimeKeys: { publicKey: string; privateKey: string } | null = null;

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@velonx.in';

  if (publicKey && privateKey) {
    return { publicKey, privateKey, subject };
  }

  // Fallback: generate dynamic in-memory key pair (never hardcoded in source)
  if (!runtimeKeys) {
    try {
      runtimeKeys = webpush.generateVAPIDKeys();
    } catch {
      runtimeKeys = { publicKey: '', privateKey: '' };
    }
  }

  return {
    publicKey: runtimeKeys.publicKey,
    privateKey: runtimeKeys.privateKey,
    subject,
  };
}

export class PushNotificationService {
  private initialized = false;

  constructor() {
    this.initVapid();
  }

  private initVapid() {
    if (this.initialized) return;
    try {
      const { publicKey, privateKey, subject } = getVapidKeys();
      if (publicKey && privateKey) {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        this.initialized = true;
      }
    } catch (error) {
      console.error('[PushNotificationService] Failed to set VAPID details:', error);
    }
  }

  /**
   * Returns the public VAPID key needed for client browser push subscription
   */
  getPublicKey(): string {
    return getVapidKeys().publicKey;
  }

  /**
   * Save or update a user's browser push subscription
   */
  async saveSubscription(
    userId: string,
    subscription: PushSubscriptionJSON,
    userAgent?: string
  ) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new ValidationError('Invalid push subscription format: endpoint and keys are required');
    }

    const { endpoint, keys } = subscription;

    const db = prisma as any;

    // Upsert subscription for user based on unique endpoint
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      return db.pushSubscription.update({
        where: { endpoint },
        data: {
          userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: userAgent || existing.userAgent,
          updatedAt: new Date(),
        },
      });
    }

    return db.pushSubscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
    });
  }

  /**
   * Remove a user's browser push subscription (when permissions are revoked or toggled off)
   */
  async removeSubscription(userId: string, endpoint: string) {
    if (!endpoint) {
      throw new ValidationError('Endpoint is required');
    }

    try {
      const db = prisma as any;
      const deleted = await db.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      });
      return { success: true, count: deleted.count };
    } catch (error) {
      console.error('[PushNotificationService] Error removing subscription:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Send a push notification to all active devices/browsers of a specific user
   */
  async sendPushToUser(userId: string, payload: PushNotificationPayload) {
    this.initVapid();

    const db = prisma as any;
    const subscriptions: any[] = await db.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0, removed: 0 };
    }

    const notificationPayloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/favicon.png',
      tag: payload.tag || `velonx-${Date.now()}`,
      actionUrl: payload.actionUrl || '/notifications',
      data: {
        url: payload.actionUrl || '/notifications',
        ...(payload.data || {}),
      },
      requireInteraction: payload.requireInteraction || false,
      vibrate: payload.vibrate || [100, 50, 100],
      actions: payload.actions || [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Dismiss' },
      ],
    });

    let sent = 0;
    let failed = 0;
    let removed = 0;

    const deadEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            notificationPayloadString,
            {
              TTL: 60 * 60 * 24, // 24 hours
              urgency: 'high',
            }
          );
          sent++;
        } catch (error: any) {
          failed++;
          console.warn(`[PushNotificationService] Failed to send push to ${sub.endpoint.slice(0, 30)}...:`, error?.statusCode || error?.message);

          // 404 (Not Found) or 410 (Gone) indicates the subscription is expired/unregistered
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            deadEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (deadEndpoints.length > 0) {
      const deleteResult = await db.pushSubscription.deleteMany({
        where: {
          endpoint: { in: deadEndpoints },
        },
      });
      removed = deleteResult.count;
    }

    return { sent, failed, removed };
  }

  /**
   * Send a test push notification to a specific push subscription
   */
  async sendDirectPush(
    subscription: PushSubscriptionJSON,
    payload: PushNotificationPayload
  ) {
    this.initVapid();

    const notificationPayloadString = JSON.stringify({
      title: payload.title || '🔔 VELONX Notification Test',
      body: payload.body || 'Desktop & Mobile notifications are now working!',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/favicon.png',
      tag: payload.tag || 'velonx-test',
      actionUrl: payload.actionUrl || '/notifications',
      data: {
        url: payload.actionUrl || '/notifications',
        ...(payload.data || {}),
      },
      requireInteraction: payload.requireInteraction ?? false,
      vibrate: payload.vibrate || [100, 50, 100],
    });

    return webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      notificationPayloadString,
      {
        TTL: 60 * 60, // 1 hour
        urgency: 'high',
      }
    );
  }
}

export const pushNotificationService = new PushNotificationService();
