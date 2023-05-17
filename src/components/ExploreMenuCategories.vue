<script setup lang="ts">
import categories from '@/helpers/categories.json';

const props = defineProps<{
  metrics: Record<string, number>;
}>();

const emit = defineEmits(['update:category']);

const { tc } = useI18n();
const route = useRoute();
const router = useRouter();

const selected = ref((route.query.category as string) || undefined);

const routeQuery = computed(() => route.query || undefined);

const categoryItems = computed(() => {
  return [
    {
      text: tc('explore.categories.all'),
      action: 'all',
      extras: {
        count: props.metrics?.all || 0,
        selected: !selected.value
      }
    },
    ...categories
      .map(c => ({
        text: tc(`explore.categories.${c}`),
        action: c,
        extras: {
          count: props.metrics?.[c] || 0,
          selected: selected.value === c
        }
      }))
      .sort((a, b) => b.extras.count - a.extras.count)
  ];
});

function selectCategory(c: string) {
  selected.value = c;
  emit('update:category', c);
  router.push({
    query: { ...routeQuery.value, category: c }
  });
}
</script>

<template>
  <BaseMenu
    class="mt-2 w-full xs:w-auto sm:mr-2 md:ml-2 md:mt-0"
    :items="categoryItems"
    @select="selectCategory"
  >
    <template #button>
      <BaseButton class="w-full whitespace-nowrap pr-3">
        <div class="leading-2 flex items-center leading-3">
          <i-ho-view-grid class="mr-2 text-xs" />
          <span v-if="selected">
            {{ $tc('explore.categories.' + selected) }}
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
