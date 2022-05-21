import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beams: any;

try {
  beams = new PusherPushNotifications.Client({
    instanceId: (import.meta.env.VITE_PUSHER_BEAMS_INSTANCE_ID as string) ?? ''
  });
} catch (e) {
  console.log(e);
}

export { beams };
