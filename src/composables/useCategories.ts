import { computed } from 'vue';
import categories from '@/helpers/categories.json';
import { useSpaces } from '@/composables/useSpaces';

export function useCategories() {
  const { orderedSpaces } = useSpaces();

  // count spaces per category
  const spacesPerCategory = computed(() => {
    const spaces = orderedSpaces.value.reduce((counters, space) => {
      if (!space.private) {
        space.categories?.forEach((c: any) => counters[c]++);
        return counters;
      }
    }, Object.fromEntries(categories.map(c => [c, 0])));
    return spaces;
  });

  const categoriesOrderedBySpaceCount = computed(() => {
    return categories.sort(
      (a, b) => spacesPerCategory.value[b] - spacesPerCategory.value[a]
    );
  });

  return {
    categories,
    spacesPerCategory,
    categoriesOrderedBySpaceCount
  };
}
