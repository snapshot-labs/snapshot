<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSpaces } from '@/composables/useSpaces';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useMediaQuery } from '@vueuse/core';

const props = defineProps<{
  userAddress: string;
}>();

const { spaces } = useSpaces();
const { apolloQuery } = useApolloQuery();

const loadingSpaces = ref(true);
const followingSpaces = ref([]);

async function loadSpaces() {
  loadingSpaces.value = true;
  try {
    Promise.all([
      (followingSpaces.value = await apolloQuery(
        {
          query: FOLLOWS_QUERY,
          variables: {
            follower_in: props.userAddress
          }
        },
        'follows'
      ))
    ]);
    loadingSpaces.value = false;
  } catch (e) {
    loadingSpaces.value = false;
    console.error(e);
  }
}

const isXSmallScreen = useMediaQuery('(max-width: 420px)');
const isSmallScreen = useMediaQuery('(max-width: 544px)');
const isLargeScreen = useMediaQuery('(max-width: 1012px)');

const numberOfSpacesByScreenSize = computed(() => {
  if (isXSmallScreen.value) {
    return 3;
  }
  if (isSmallScreen.value) {
    return 4;
  }
  if (isLargeScreen.value) {
    return 5;
  }
  return 7;
});

onMounted(() => loadSpaces());
</script>

<template>
  <BaseBlock
    :title="$t('profile.about.joinedSpaces')"
    :counter="followingSpaces.length"
  >
    <template
      v-if="loadingSpaces || followingSpaces.length"
      v-slot:namedDefault
    >
      <ProfileAboutSpacesListSkeleton
        v-if="loadingSpaces || !Object.keys(spaces).length"
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
        />
      </div>
    </template>
  </BaseBlock>
</template>
