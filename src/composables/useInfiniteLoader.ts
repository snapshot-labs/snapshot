import { ref } from 'vue';

export function useInfiniteLoader(loadBy = 6) {
  const loadingMore = ref(false);
  const stopLoadingMore = ref(false);

  async function loadMore(loadFn, loading = false) {
    if (!stopLoadingMore.value && !loading) {
      loadingMore.value = true;
      await loadFn();
      loadingMore.value = false;
    }
  }

  return { loadBy, loadingMore, stopLoadingMore, loadMore };
}
