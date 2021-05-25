import { onMounted, onBeforeUnmount } from 'vue';
import scrollMonitor from 'scrollmonitor';

export function useElementWatcher(fn) {
  let elementWatcher;

  onMounted(() => {
    const el = document.getElementById('endofpage');
    elementWatcher = scrollMonitor.create(el);
    elementWatcher.enterViewport(() => {
      fn();
    });
  });

  onBeforeUnmount(() => elementWatcher.destroy());
}
