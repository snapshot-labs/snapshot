export function useInfiniteLoader(loadBy = 6) {
  const loadingMore = ref(false);
  const stopLoadingMore = ref(false);

  async function loadMore(loadFn) {
    if (loadingMore.value) return;
    if (!stopLoadingMore.value) {
      loadingMore.value = true;
      await loadFn();
      loadingMore.value = false;
    }
  }

  return { loadBy, loadingMore, stopLoadingMore, loadMore };
}
