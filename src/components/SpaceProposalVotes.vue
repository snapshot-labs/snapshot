<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const VOTES_LIMIT = 6;

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
  <BaseBlock
    v-if="proposal.votes > 0"
    :title="$t('votes')"
    :counter="voteCount"
    :loading="loadingVotes"
    slim
  >
    <template v-if="props.proposal.state === 'closed'" #button>
      <BaseButtonIcon
        v-tippy="{ content: $t('proposal.downloadCsvVotes.title') }"
        :loading="isDownloadingVotes"
        @click="downloadReport(proposal.id)"
      >
        <i-ho-download />
      </BaseButtonIcon>
    </template>
    <SpaceProposalVotesItem
      v-for="(vote, i) in votes"
      :key="i"
      :vote="vote"
      :profiles="profiles"
      :space="space"
      :proposal="proposal"
      :class="{ '!border-0': i === 0 }"
      :data-testid="`proposal-votes-list-item-${i}`"
      class="!px-4"
    />
    <a
      v-if="proposal.votes > VOTES_LIMIT"
      tabindex="0"
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="modalVotesOpen = true"
      @keypress="modalVotesOpen = true"
    >
      <span v-text="$t('seeMore')" />
    </a>
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
  </BaseBlock>
</template>
