import { ref } from 'vue';

interface Notification {
  id: number;
  message: string;
  type: string;
  remove(): any;
}

const items = ref<Notification[]>([]);

export function useNotifications() {
  function notify(payload: any, duration = 4000) {
    const item: Notification = {
      id: Math.floor(Date.now() * Math.random()),
      message: Array.isArray(payload) ? payload[1] : payload,
      type: Array.isArray(payload) ? payload[0] : 'green',
      remove() {
        items.value.splice(
          items.value.findIndex(i => i.id === this.id),
          1
        );
      }
    };

    items.value.push(item);
    setTimeout(() => item.remove(), duration);
  }

  return { notify, items };
}
