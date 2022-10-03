import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // TODO: config
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(() => console.log('Service worker registered!'))
    .catch(err => console.error(err));
} else {
  console.warn('Service worker not available');
}

onMessage(messaging, payload => {
  if (!payload.notification) {
    return;
  }

  const {
    notification: { title, body }
  } = payload;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistration('/firebase-cloud-messaging-push-scope')
      .then(registration => {
        if (registration) {
          registration.showNotification(title as string, {
            body,
            icon: '/avatar.png'
          });
        }
      });
  }
});

export default messaging;
