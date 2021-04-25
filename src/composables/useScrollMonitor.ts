import scrollMonitor from 'scrollmonitor';

export function useScrollMonitor(fn) {
  let canRunAgain = true;

  const el = document.getElementById('endofpage');
  const elementWatcher = scrollMonitor.create(el);
  elementWatcher.enterViewport(() => {
    if (canRunAgain) {
      canRunAgain = false;
      fn();

      setTimeout(function () {
        canRunAgain = true;
      }, 100);
    }
  });
}
