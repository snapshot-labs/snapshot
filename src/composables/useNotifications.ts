import { reactive, toRefs } from 'vue';

interface Notification {
  message: string;
  type: string;
  timestamp: number;
}

const state = reactive({
  items: [] as Notification[]
});

export function useNotifications() {
  const notify = payload => {
    const item = Array.isArray(payload)
      ? { message: payload[1], type: payload[0], timestamp: Date.now() }
      : { message: payload, type: 'green', timestamp: Date.now() };

    state.items.push(item);
  };

  return { notify, ...toRefs(state) };
}
