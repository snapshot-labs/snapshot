import { ref } from 'vue';

export function useInfiniteLoader(loadBy) {
  const limit = ref(loadBy);
  const loadingMore = ref(false);
  const stopLoadingMore = ref(false);

  async function loadMore(loadFn, loading) {
    if (!stopLoadingMore.value && !loading) {
      loadingMore.value = true;
      await loadFn();
      limit.value += loadBy;
      loadingMore.value = false;
    }
  }

  return { loadBy, limit, loadingMore, stopLoadingMore, loadMore };
}
