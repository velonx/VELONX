// VELONX Platform - Web Push & Desktop / Mobile Notification Service Worker
// Version: 1.0.0

const CACHE_NAME = 'velonx-notifications-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'VELONX Notification',
    body: 'You have a new update on VELONX.',
    icon: '/logo.png',
    badge: '/favicon.png',
    data: {
      url: '/notifications',
      timestamp: Date.now(),
    },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || payload.description || notificationData.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/favicon.png',
        tag: payload.tag || `velonx-${Date.now()}`,
        data: {
          url: payload.actionUrl || payload.url || (payload.data && payload.data.url) || '/notifications',
          id: payload.id,
          timestamp: Date.now(),
          ...payload.data,
        },
        vibrate: payload.vibrate || [100, 50, 100],
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions || [
          { action: 'open', title: 'Open' },
          { action: 'close', title: 'Dismiss' },
        ],
      };
    } catch (e) {
      // If not JSON, use text payload
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event - focus or open window
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === 'close') {
    return;
  }

  const targetUrl = (notification.data && notification.data.url) || '/notifications';

  // Resolve full URL relative to origin
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  const promiseChain = self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    // Check if there is already a window open with this app
    for (let client of windowClients) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        // Navigate and focus existing window
        return client.navigate(fullUrl).then((focusedClient) => {
          return focusedClient ? focusedClient.focus() : client.focus();
        });
      }
    }

    // If no existing window is open, open a new one
    if (self.clients.openWindow) {
      return self.clients.openWindow(fullUrl);
    }
  });

  event.waitUntil(promiseChain);
});

// Handle subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            userAgent: navigator.userAgent,
          }),
        });
      })
      .catch((err) => {
        console.error('[SW] pushsubscriptionchange failed:', err);
      })
  );
});
