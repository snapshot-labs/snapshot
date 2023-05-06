<script setup lang="ts">
import { shorten } from '@/helpers/utils';

const { formatCompactNumber } = useIntl();

const { spaces, loadSpacesHome, isLoadingSpacesHome } = useSpaces();

onMounted(() => {
  loadSpacesHome();
});
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
          v-for="(space, i) in spaces"
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
            <div v-text="formatCompactNumber(space.proposals)" />
            <div
              v-if="space.proposals_7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.proposals_7d)}`"
            />
          </div>
          <div class="w-[120px]">
            <div v-text="formatCompactNumber(space.votes)" />
            <div
              v-if="space.votes_7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.votes_7d)}`"
            />
          </div>
          <div class="w-[120px]">
            <div v-text="formatCompactNumber(space.followers)" />
            <div
              v-if="space.followers_7d"
              class="text-green"
              v-text="`+${formatCompactNumber(space.followers_7d)}`"
            />
          </div>
        </router-link>
        <LoadingSpinner v-if="!isLoadingSpacesHome" class="p-3" />
      </BaseBlock>
    </BaseContainer>
  </div>
</template>
