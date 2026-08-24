'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'unsupported';
  loading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState<boolean>(true);

  // Check support and current subscription status
  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (!supported) {
      setPermission('unsupported');
      setLoading(false);
      return;
    }

    setPermission(Notification.permission);

    try {
      // Register service worker if not yet registered
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.warn('[usePushNotifications] Error checking push status:', err);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Request permission and subscribe
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Browser notifications are not supported on this device/browser');
      return false;
    }

    setLoading(true);

    try {
      // 1. Request Notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        if (perm === 'denied') {
          toast.error('Notification permission was denied. Please enable notifications in your browser settings.');
        }
        setLoading(false);
        return false;
      }

      // 2. Ensure Service Worker is registered and active
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Fetch public VAPID key
      const vapidRes = await fetch('/api/push/vapid-key');
      const vapidData = await vapidRes.json();
      const publicKey = vapidData?.data?.publicKey;

      if (!publicKey) {
        throw new Error('Unable to retrieve public notification key');
      }

      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      // 4. Subscribe with PushManager
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as BufferSource,
        });
      }

      // 5. Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription on server');
      }

      setIsSubscribed(true);
      toast.success('Desktop & Mobile notifications enabled!', {
        icon: '🔔',
      });
      return true;
    } catch (err: any) {
      console.error('[usePushNotifications] Subscribe error:', err);
      toast.error(err.message || 'Failed to enable notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        // Unsubscribe locally
        await subscription.unsubscribe();

        // Unsubscribe on server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (err: any) {
      console.error('[usePushNotifications] Unsubscribe error:', err);
      toast.error('Failed to disable push notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Send a test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const granted = await subscribe();
      if (!granted) return false;
    }

    try {
      // 1. Try sending via backend Web Push
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🔔 VELONX Notification Test',
          body: 'Success! You will receive updates, events, and message alerts here.',
          actionUrl: '/notifications',
        }),
      });

      const data = await res.json();

      // 2. Also trigger local browser notification for immediate visual feedback
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await (reg as any).showNotification('🔔 VELONX Notification Test', {
            body: 'Success! You will receive updates, events, and message alerts here.',
            icon: '/logo.png',
            badge: '/favicon.png',
            vibrate: [100, 50, 100],
            data: { url: '/notifications' },
          });
        }
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🔔 VELONX Notification Test', {
          body: 'Success! You will receive updates, events, and message alerts here.',
          icon: '/logo.png',
        });
      }

      toast.success('Test notification sent!');
      return true;
    } catch (err: any) {
      console.error('[usePushNotifications] Test notification error:', err);
      toast.error('Failed to send test notification');
      return false;
    }
  }, [isSupported, subscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkStatus,
  };
}
