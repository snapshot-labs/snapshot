export function useDetectInput() {
  function isTouchScreen() {
    return window.matchMedia('(pointer: coarse)').matches;
  }
  return { isTouchScreen };
}
