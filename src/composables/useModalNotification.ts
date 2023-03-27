interface Notification {
  id: number;
  description: string;
  type: 'info' | 'warning' | 'warning-red';
  remove(): any;
}

const items = ref<Notification[]>([]);

export function useModalNotification() {
  function notifyModal(
    type: 'info' | 'warning' | 'warning-red',
    description: string
  ) {
    const item: Notification = {
      id: Math.floor(Date.now() * Math.random()),
      description,
      type,
      remove() {
        items.value.splice(
          items.value.findIndex(i => i.id === this.id),
          1
        );
      }
    };

    items.value.push(item);
  }

  return { notifyModal, items };
}
