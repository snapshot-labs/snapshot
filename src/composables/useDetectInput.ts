/**
 * Touchscreen detection based on media property.
 * TODO: Can be moved to @/helpers/utils or useMediaQuery
 */
export function useDetectInput() {
  function isTouchScreen() {
    return window.matchMedia('(pointer: coarse)').matches;
  }
  return { isTouchScreen };
}
