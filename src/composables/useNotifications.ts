import { useStore } from 'vuex';

export function useNotifications() {
  const store = useStore();

  const notify = payload => {
    store.dispatch('notify', payload);
  };

  return { notify };
}
