/**
 * Debounce function for delayed input handling (e.g. wait for user to stop typing).
 * TODO: Can be moved to @/helpers/utils
 */
export function useDebounce() {
  let timeout: any = null;
  return function (fnc, delayMs) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fnc();
    }, delayMs || 800);
  };
}
