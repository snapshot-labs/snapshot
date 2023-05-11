<script setup lang="ts">
import categories from '@/helpers/categories.json';
import { METRICS_QUERY } from '@/helpers/queries';

type Category = string;

type CategoryMetrics = {
  [key in Category]: number;
};

const selectedCategory = ref('');
const categoryMetrics = ref<CategoryMetrics>({});

const { tc } = useI18n();
const route = useRoute();
const router = useRouter();
const { apolloQuery } = useApolloQuery();

const routeQuery = computed(() => route.query || undefined);

const categoryItems = computed(() => {
  return [
    {
      text: tc('explore.categories.all'),
      action: 'all',
      extras: {
        count: categoryMetrics.value?.all || 0,
        selected: !selectedCategory.value
      }
    },
    ...categories.map(c => ({
      text: tc(`explore.categories.${c}`),
      action: c,
      extras: {
        count: categoryMetrics.value?.[c] || 0,
        selected: selectedCategory.value === c
      }
    }))
  ].sort((a, b) => b.extras.count - a.extras.count);
});

function selectCategory(c: string) {
  selectedCategory.value = c;
  router.push({
    query: { ...routeQuery.value, category: c }
  });
}

async function loadCategoryMetrics() {
  const response = await apolloQuery(
    {
      query: METRICS_QUERY,
      variables: {}
    },
    'metrics'
  );
  categoryMetrics.value = response.categories;
}

onMounted(() => {
  const category = routeQuery.value.category;
  if (category) {
    selectedCategory.value = category as string;
  }

  loadCategoryMetrics();
});
</script>

<template>
  <BaseMenu
    class="mt-2 w-full xs:w-auto sm:mr-2 md:ml-2 md:mt-0"
    :selected="selectedCategory"
    :items="categoryItems"
    @select="selectCategory"
  >
    <template #button>
      <BaseButton class="w-full whitespace-nowrap pr-3">
        <div class="leading-2 flex items-center leading-3">
          <i-ho-view-grid class="mr-2 text-xs" />
          <span v-if="selectedCategory">
            {{ $tc('explore.categories.' + selectedCategory) }}
          </span>
          <span v-else>
            {{ $tc('explore.category') }}
          </span>
          <i-ho-chevron-down class="ml-1 text-xs text-skin-text" />
        </div>
      </BaseButton>
    </template>
    <template #item="{ item }">
      <div class="flex">
        <span class="mr-3">{{ item.text }}</span>
        <span class="ml-auto mt-[-3px] flex">
          <BaseCounter :counter="item.extras.count" class="my-auto" />
        </span>
      </div>
    </template>
  </BaseMenu>
</template>
