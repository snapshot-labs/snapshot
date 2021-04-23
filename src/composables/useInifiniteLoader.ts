import { ref } from 'vue';

export function useInfiniteLoader() {
  const loadBy = 15;
  const limit = ref(loadBy);
  const loadingMore = ref(false);
  const loadedItems = ref([]);
  const stopLoadingMore = ref(false);

  async function loadMore(loadFn) {
    if (!stopLoadingMore.value && loadedItems.value[0]) {
      loadingMore.value = true;
      await loadFn(limit.value);
      limit.value += loadBy;
      loadingMore.value = false;
    }
  }

  return { loadBy, limit, loadingMore, loadedItems, stopLoadingMore, loadMore };
}
