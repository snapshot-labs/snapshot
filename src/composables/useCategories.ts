import categories from '@/helpers/categories.json';
import { useApp } from '@/composables/useApp';

export function useCategories() {
  const { explore } = useApp();
  const spaces = explore.value.spaces;

  // count spaces per category
  const spacesPerCategory = Object.fromEntries(categories.map(c => [c, 0]));
  Object.keys(spaces).forEach(s => {
    if (!spaces[s].private) {
      spaces[s].categories?.forEach((c: any) => spacesPerCategory[c]++)
    }
  });

  return {
    categories,
    spacesPerCategory
  };
}
