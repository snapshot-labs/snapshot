import { onBeforeMount, onBeforeUnmount, ref, computed } from 'vue';
// Breakpoints from PrimerCSS
export function useMediaQuery() {
  const width = ref(window.innerWidth);

  const isXSmallScreen = computed(() => width.value < 420);
  const isSmallScreen = computed(() => width.value < 544);
  const isMediumScreen = computed(() => width.value < 768);
  const isLargeScreen = computed(() => width.value < 1012);
  const isXLargeScreen = computed(() => width.value < 1280);

  function updateWidth() {
    width.value = window.innerWidth;
  }

  onBeforeMount(() => window.addEventListener('resize', updateWidth));
  onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));

  return {
    isXSmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isXLargeScreen
  };
}
