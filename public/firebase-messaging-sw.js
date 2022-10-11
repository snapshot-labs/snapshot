importScripts(
  'https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js'
);

const firebaseConfig = {
  // TODO: config
};

try {
  firebase.initializeApp(firebaseConfig);

  const isSupported = firebase.messaging.isSupported();

  if (isSupported) {
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(payload => {
      const {
        fcmOptions,
        notification: { title, body }
      } = payload;
      self.registration.showNotification(title, {
        body,
        icon: '/avatar.png',
        data: fcmOptions
      });
    });
  }
} catch (e) {
  // Do nothing
}

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (!event.notification.data) return;
  const pathname = event.notification.data.link;
  const url = new URL(pathname, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientsArr => {
        const hadWindowToFocus = clientsArr.some(windowClient =>
          windowClient.url === url ? (windowClient.focus(), true) : false
        );

        if (!hadWindowToFocus)
          self.clients
            .openWindow(url)
            .then(windowClient => (windowClient ? windowClient.focus() : null));
      })
  );
});
