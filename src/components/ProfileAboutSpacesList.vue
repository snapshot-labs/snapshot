<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpaces } from '@/composables/useSpaces';
import { useMediaQuery } from '@vueuse/core';

defineProps<{
  userAddress: string;
  followingSpaces: string[];
  loadingFollowedSpaces: boolean;
}>();

const { spaces } = useSpaces();

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
  <BaseBlock
    :title="$t('profile.about.joinedSpaces')"
    :counter="followingSpaces.length"
    hideBottomBorder
    slim
  >
    <div
      v-if="loadingFollowedSpaces || followingSpaces.length"
      class="border-t py-4 px-4"
    >
      <ProfileAboutSpacesListSkeleton
        v-if="loadingFollowedSpaces || !Object.keys(spaces).length"
        :numberOfSpaces="numberOfSpacesByScreenSize"
      />
      <div v-else class="flex justify-between">
        <div class="flex w-full overflow-x-hidden">
          <div
            class="text-center max-w-[66px] min-w-[66px] mx-2 first:ml-0"
            v-for="space in followingSpaces.map((f: any) => f.space.id).slice(0, numberOfSpacesByScreenSize)"
            :key="space"
          >
            <ProfileAboutSpacesListItem
              v-if="spaces?.[space]"
              :space="spaces[space]"
            />
          </div>
        </div>
        <ProfileAboutSpacesListButtonMore
          v-if="numberOfSpacesByScreenSize < followingSpaces.length"
          @click="modalSpacesOpen = true"
        />
      </div>
    </div>
    <div v-else class="p-4 border-t">
      {{ $t('profile.about.notJoinSpacesYet') }}
    </div>
  </BaseBlock>
  <teleport to="#modal">
    <ModalSpaces
      :followingSpaces="followingSpaces.map((f: any) => f.space.id)"
      :open="modalSpacesOpen"
      @close="modalSpacesOpen = false"
    />
  </teleport>
</template>
