import { onMounted, onBeforeUnmount, ref } from 'vue';
import scrollMonitor from 'scrollmonitor';

export function useScrollMonitor(fn) {
  let elementWatcher;

  const endElement: any = ref(null);

  onMounted(() => {
    elementWatcher = scrollMonitor.create(endElement.value);
    elementWatcher.enterViewport(() => {
      fn();
    });
  });

  onBeforeUnmount(() => elementWatcher.destroy());

  return { endElement };
}
