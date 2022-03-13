import { onMounted, onBeforeUnmount, ref } from 'vue';
import scrollMonitor from 'scrollmonitor';

export function useScrollMonitor(fn) {
  let elementWatcher;

  const endElement: any = ref(null);

  onMounted(() => {
    const containerElement = document.getElementById('content');
    const containerMonitor = scrollMonitor.createContainer(
      containerElement as HTMLElement
    );
    elementWatcher = containerMonitor.create(endElement.value);
    elementWatcher.enterViewport(fn);
  });

  onBeforeUnmount(() => elementWatcher.destroy());

  return { endElement };
}
