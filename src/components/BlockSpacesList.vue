<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { Space } from '@/helpers/interfaces';

defineProps<{
  spaces: Space[];
  title: string;
  message?: string;
  loading?: boolean;
}>();

const modalSpacesOpen = ref(false);

const isXSmallScreen = useMediaQuery('(max-width: 420px)');
const isSmallScreen = useMediaQuery('(max-width: 544px)');
const isMediumScreen = useMediaQuery('(max-width: 768px)');

const numberOfSpacesByScreenSize = computed(() => {
  if (isXSmallScreen.value) {
    return 3;
  }
  if (isSmallScreen.value) {
    return 4;
  }
  if (isMediumScreen.value) {
    return 5;
  }
  return 7;
});
</script>

<template>
  <div>
    <BaseBlock :title="title" :counter="spaces.length" hide-bottom-border slim>
      <div v-if="loading || spaces.length" class="border-t px-4 py-4">
        <BlockSpacesListSkeleton
          v-if="loading"
          :number-of-spaces="numberOfSpacesByScreenSize"
        />

        <div v-else class="flex justify-between">
          <div class="flex w-full overflow-x-hidden">
            <div
              v-for="space in spaces"
              :key="space.id"
              class="mx-2 min-w-[66px] max-w-[66px] text-center first:ml-0"
            >
              <BlockSpacesListItem :space="space" />
            </div>
          </div>
          <BlockSpacesListButtonMore
            v-if="numberOfSpacesByScreenSize < spaces.length"
            @click="modalSpacesOpen = true"
          />
        </div>
      </div>
      <div v-else class="border-t p-4">
        {{ message || $t('noResultsFound') }}
      </div>
    </BaseBlock>
    <teleport to="#modal">
      <ModalSpaces
        :spaces="spaces"
        :open="modalSpacesOpen"
        @close="modalSpacesOpen = false"
      />
    </teleport>
  </div>
</template>
