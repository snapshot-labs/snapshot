<script setup>
import { onMounted, computed } from 'vue';
import orderBy from 'lodash/orderBy';
import { useSpaces } from '@/composables/useSpaces';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { useI18n } from '@/composables/useI18n';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const { spaces, spacesLoaded } = useSpaces();
const { formatCompactNumber } = useIntl();
const { setPageTitle } = useI18n();

const limit = 200;

const spacesSorted = computed(() => {
  const spacesArr = Object.values(spaces.value)
    .map(space => {
      space.proposals = space.proposals || 0;
      space.proposals_1d = space.proposals_1d || 0;
      space.proposals_7d = space.proposals_7d || 0;
      space.votes = space.votes || 0;
      space.votes_1d = space.votes_1d || 0;
      space.votes_7d = space.votes_7d || 0;
      space.voters = space.voters || 0;
      space.voters_1d = space.voters_1d || 0;
      space.voters_7d = space.voters_7d || 0;
      space.followers = space.followers || 0;
      space.followers_1d = space.followers_1d || 0;
      space.followers_7d = space.followers_7d || 0;
      space.ranking =
        space.voters / 20 +
        space.votes_7d +
        space.voters_7d +
        space.proposals_7d * 50 +
        space.followers_7d;
      return space;
    })
    .filter(space => verified[space.id] !== -1);
  return orderBy(spacesArr, ['ranking'], ['desc']).slice(0, limit);
});
onMounted(() => setPageTitle('page.title.ranking'));
</script>

<template>
  <div>
    <BaseContainer :slim="true">
      <BaseBlock slim>
        <div class="flex border-b p-3 text-right">
          <div class="mr-2 w-[40px] text-left" v-text="'Rank'" />
          <div class="flex-auto text-left" v-text="'Space'" />
          <div class="w-[120px]" v-text="'Proposals'" />
          <div class="w-[120px]" v-text="'Votes'" />
          <div class="w-[120px]" v-text="'Members'" />
        </div>
        <router-link
          v-for="(space, i) in spacesSorted"
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
        <LoadingSpinner v-if="!spacesLoaded" class="p-3" />
      </BaseBlock>
    </BaseContainer>
  </div>
</template>
