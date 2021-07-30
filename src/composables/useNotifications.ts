import { ref } from 'vue';

interface Notification {
  message: string;
  type: string;
  timestamp: number;
}

const items = ref<Notification[]>([]);

export function useNotifications() {
  function notify(payload) {
    const item = Array.isArray(payload)
      ? { message: payload[1], type: payload[0], timestamp: Date.now() }
      : { message: payload, type: 'green', timestamp: Date.now() };

    items.value.push(item);
  }

  return { notify, items };
}
