<script setup lang="ts">
import { computed } from 'vue';
import { useCategories, useSpaces, useI18n } from '@/composables';

const { spacesPerCategory, categoriesOrderedBySpaceCount } = useCategories();
const { selectedCategory, orderedSpaces } = useSpaces();
const { tc } = useI18n();

function selectCategory(c) {
  selectedCategory.value = c;
}

const categoryItems = computed(() => {
  return [
    {
      text: tc('explore.categories.all'),
      action: 'all',
      extras: {
        count: orderedSpaces.value.length,
        selected: !selectedCategory.value
      }
    },
    ...categoriesOrderedBySpaceCount.value
      .filter(c => spacesPerCategory.value[c])
      .map(c => ({
        text: tc(`explore.categories.${c}`),
        action: c,
        extras: {
          count: spacesPerCategory.value[c],
          selected: selectedCategory.value === c
        }
      }))
  ];
});
</script>

<template>
  <BaseMenu
    class="w-full xs:w-auto"
    :items="categoryItems"
    @select="selectCategory"
  >
    <template #button>
      <div
        class="group w-full whitespace-nowrap px-2 py-2"
        :disabled="!orderedSpaces.length"
      >
        <div class="leading-2 flex items-center leading-3">
          <i-ho-view-grid class="mr-2 text-xs" />

          <span v-if="selectedCategory" class="group-hover:text-skin-link">
            {{ $tc('explore.categories.' + selectedCategory) }}
          </span>
          <span v-else class="group-hover:text-skin-link">
            {{ $tc('explore.category') }}
          </span>
          <i-ho-chevron-down class="ml-1 text-xs text-skin-text" />
        </div>
      </div>
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
