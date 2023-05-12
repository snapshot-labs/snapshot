<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useInfiniteScroll } from '@vueuse/core';

const { formatCompactNumber } = useIntl();

const {
  spacesRanking,
  loadSpacesRanking,
  loadMoreSpacesRanking,
  loadingSpacesRanking,
  loadingMoreSpacesRanking
} = useSpaces();

onMounted(() => {
  loadSpacesRanking();
});

useInfiniteScroll(
  document,
  () => {
    loadMoreSpacesRanking();
  },
  { distance: 250, interval: 500 }
);
</script>

<template>
  <div>
    <BaseContainer slim>
      <BaseBlock slim>
        <div class="flex border-b p-3 text-right">
          <div class="mr-2 w-[40px] text-left" v-text="'Rank'" />
          <div class="flex-auto text-left" v-text="'Space'" />
          <div class="w-[120px]" v-text="'Proposals'" />
          <div class="w-[120px]" v-text="'Votes'" />
          <div class="w-[120px]" v-text="'Members'" />
        </div>

        <router-link
          v-for="(space, i) in spacesRanking"
          :key="space.id"
          :to="{ name: 'spaceProposals', params: { key: space.id } }"
          class="flex border-b p-3 text-right last:border-b-0"
        >
          <div class="mr-2 mt-2 w-[40px] pt-1 text-center" v-text="i + 1" />
          <div class="flex flex-auto space-x-3 text-left">
            <AvatarSpace :space="space" size="32" />
            <div>
              <div v-text="shorten(space.name, 32)" />
              <div class="text-skin-text" v-text="shorten(space.id, 32)" />
            </div>
          </div>
          <div class="w-[120px]">
            <div v-text="formatCompactNumber(space.proposalsCount)" />
            <div
              v-if="space.proposalsCount7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.proposalsCount7d)}`"
            />
          </div>
          <div class="w-[120px]">
            <div v-text="formatCompactNumber(space.votesCount)" />
            <div
              v-if="space.votesCount7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.votesCount7d)}`"
            />
          </div>
          <div class="w-[120px]">
            <div v-text="formatCompactNumber(space.followersCount)" />
            <div
              v-if="space.followersCount7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.followersCount7d)}`"
            />
          </div>
        </router-link>
        <div
          v-if="loadingSpacesRanking || loadingMoreSpacesRanking"
          class="flex"
        >
          <LoadingSpinner class="mx-auto py-3" big />
        </div>
      </BaseBlock>
    </BaseContainer>
  </div>
</template>
