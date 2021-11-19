import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beams: any;

(async () => {
  try {
    window.navigator.serviceWorker.register(import.meta.env.VITE_BASE_PATH + 'service-worker.js');
    const serviceWorkerRegistration = await window.navigator.serviceWorker.ready;
  
    beams = new PusherPushNotifications.Client({
      instanceId: (import.meta.env.VITE_PUSHER_BEAMS_INSTANCE_ID as string) ?? '',
      serviceWorkerRegistration
    });
  } catch (e) {
    console.log(e);
  }
})();

export { beams };
