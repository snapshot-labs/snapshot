export function useMediaQuery() {
  function isXXSmallScreen() {
    return window.matchMedia('(max-width: 350px)').matches;
  }
  function isXSmallScreen() {
    return window.matchMedia('(max-width: 475px)').matches;
  }
  function isSmallScreen() {
    return window.matchMedia('(max-width: 640px)').matches;
  }
  return { isXXSmallScreen, isXSmallScreen, isSmallScreen };
}
