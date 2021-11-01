import * as PusherPushNotifications from '@pusher/push-notifications-web';

const beams = new PusherPushNotifications.Client({
  instanceId: (import.meta.env.VITE_PUSHER_BEAMS_INSTANCE_ID as string) ?? ''
});

export { beams };
