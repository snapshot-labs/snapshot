<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { useBreakpoints } from '@vueuse/core';
import { SNAPSHOT_BREAKPOINTS } from '@/helpers/constants';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const VOTES_LIMIT = 6;

const isSmallScreen = useBreakpoints(SNAPSHOT_BREAKPOINTS).smaller('sm');

const { profiles, votes, loadingVotes, loadVotes } = useProposalVotes(
  props.proposal,
  VOTES_LIMIT
);

const modalVotesOpen = ref(false);

const voteCount = computed(() => props.proposal.votes);

const showModalDownloadMessage = ref(false);
const { downloadVotes, isDownloadingVotes, errorCode } = useReportDownload();

async function downloadReport(proposalId: string) {
  const response = await downloadVotes(proposalId);

  if (!response) {
    showModalDownloadMessage.value = true;
  }
}

watch(
  () => props.proposal,
  async () => await loadVotes(),
  { immediate: true }
);
</script>

<template>
  <TuneBlock v-if="proposal.votes > 0" :loading="loadingVotes">
    <template #header>
      <TuneBlockHeader :title="$t('votes')" :counter="voteCount">
        <BaseButtonIcon
          v-if="props.proposal.state === 'closed'"
          v-tippy="{
            content: $t('proposal.downloadCsvVotes.title'),
            delay: 100
          }"
          :loading="isDownloadingVotes"
          class="!p-0 !pr-1"
          @click="downloadReport(proposal.id)"
        >
          <i-ho-download />
        </BaseButtonIcon>
      </TuneBlockHeader>
    </template>
    <SpaceProposalVotesItem
      v-for="(vote, i) in votes"
      :key="i"
      :vote="vote"
      :profiles="profiles"
      :space="space"
      :proposal="proposal"
      :is-small="isSmallScreen"
      :data-testid="`proposal-votes-list-item-${i}`"
      class="last:pb-0"
    />
    <div v-if="proposal.votes > VOTES_LIMIT" class="pt-3">
      <TuneButton
        class="w-full"
        @click="modalVotesOpen = true"
        @keypress="modalVotesOpen = true"
      >
        View all
      </TuneButton>
    </div>
    <teleport to="#modal">
      <SpaceProposalVotesModalDownload
        :open="showModalDownloadMessage"
        :error-code="errorCode"
        @close="showModalDownloadMessage = false"
      />
      <SpaceProposalVotesModal
        :space="space"
        :proposal="proposal"
        :open="modalVotesOpen"
        @close="modalVotesOpen = false"
      />
    </teleport>
  </TuneBlock>
</template>
