<script setup lang="ts">
import { useCategories, useSpaces } from '@/composables';

const { spacesPerCategory, categoriesOrderedBySpaceCount } = useCategories();
const { selectedCategory, orderedSpaces } = useSpaces();

function selectCategory(c) {
  selectedCategory.value = c === selectedCategory.value ? '' : c;
}
</script>

<template>
  <BaseDropdown
    class="mt-2 w-full xs:w-auto sm:mr-2 md:ml-2 md:mt-0"
    :items="[
      {
        text: $tc('explore.categories.all'),
        action: '',
        count: orderedSpaces.length,
        selected: !selectedCategory
      },
      ...categoriesOrderedBySpaceCount
        .filter(c => spacesPerCategory[c])
        .map(c => ({
          text: $tc('explore.categories.' + c),
          action: c,
          count: spacesPerCategory[c],
          selected: selectedCategory === c
        }))
    ]"
    @select="selectCategory($event)"
  >
    <template #button>
      <BaseButton
        class="w-full whitespace-nowrap pr-3"
        :disabled="!orderedSpaces.length"
      >
        <div class="leading-2 flex items-center leading-3">
          <i-ho-view-grid class="mr-2 text-xs" />
          <span v-if="selectedCategory">
            {{ $tc('explore.categories.' + selectedCategory) }}
          </span>
          <span v-else>
            {{ $tc('explore.categories.all') }}
          </span>
          <i-ho-chevron-down class="ml-1 text-xs text-skin-text" />
        </div>
      </BaseButton>
    </template>
    <template #item="{ item }">
      <div class="flex">
        <span class="mr-3">{{ item.text }}</span>
        <span class="ml-auto mt-[-3px] flex">
          <BaseCounter :counter="item.count" class="my-auto" />
        </span>
      </div>
    </template>
  </BaseDropdown>
</template>
