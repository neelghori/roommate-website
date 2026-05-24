/* Roommat Web Push — receives push from backend and shows OS notification. */

self.addEventListener('push', (event) => {
  let data = {
    title: 'Roommat',
    body: '',
    url: '/notifications',
    icon: '/favicon-32x32.png',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === 'object') {
        data = { ...data, ...parsed };
      }
    } catch {
      const text = event.data.text();
      if (text) data.body = text;
    }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon-32x32.png',
    badge: '/favicon-32x32.png',
    tag: data.notificationId ? `roommat-${data.notificationId}` : 'roommat-notification',
    renotify: true,
    data: {
      url: data.url || '/notifications',
      notificationId: data.notificationId,
      type: data.type,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Roommat', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const absolute =
        targetPath.startsWith('http') ? targetPath : `${self.location.origin}${targetPath}`;

      for (const client of clientList) {
        const href = client.url || '';
        if (href.startsWith(self.location.origin) && 'focus' in client) {
          if (typeof client.navigate === 'function') {
            return client.focus().then(() => client.navigate(absolute));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absolute);
      }
      return undefined;
    }),
  );
});
