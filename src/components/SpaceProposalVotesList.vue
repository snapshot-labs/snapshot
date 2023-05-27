<script setup lang="ts">
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  strategies: SpaceStrategy[];
  userVote: Vote | null;
}>();

const { isZero, loadedVotes, sortedVotes, loadVotes, profiles } =
  useProposalVotes(props.proposal, 6, props.userVote);

const modalVotesmOpen = ref(false);

const voteCount = computed(() => props.proposal.votes);

const showModalDownloadMessage = ref(false);
const { downloadVotes, isDownloadingVotes, errorCode } = useReportDownload();

async function downloadReport(proposalId: string) {
  const response = await downloadVotes(proposalId);

  if (!response) {
    showModalDownloadMessage.value = true;
  }
}

onMounted(async () => {
  await loadVotes();
});
</script>

<template>
  <BaseBlock
    v-if="!isZero"
    :title="$t('votes')"
    :counter="voteCount"
    :loading="!loadedVotes"
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
      <ModalMessage
        :open="showModalDownloadMessage"
        :title="$t('proposal.downloadCsvVotes.postDownloadModal.title')"
        :message="
          $t(
            `proposal.downloadCsvVotes.postDownloadModal.message.${
              errorCode?.message === 'PENDING_GENERATION'
                ? 'pendingGeneration'
                : 'unknownError'
            }`
          )
        "
        :level="'warning'"
        @close="showModalDownloadMessage = false"
      >
      </ModalMessage>
    </template>
    <SpaceProposalVotesListItem
      v-for="(vote, i) in sortedVotes"
      :key="i"
      :vote="vote"
      :profiles="profiles"
      :space="space"
      :proposal="proposal"
      :class="{ '!border-0': i === 0 }"
      :data-testid="`proposal-votes-list-item-${i}`"
    />
    <a
      v-if="sortedVotes.length < voteCount"
      tabindex="0"
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="modalVotesmOpen = true"
    >
      <span v-text="$t('seeMore')" />
    </a>
    <teleport to="#modal">
      <SpaceProposalVotesModal
        :space="space"
        :proposal="proposal"
        :strategies="strategies"
        :user-vote="userVote"
        :open="modalVotesmOpen"
        @close="modalVotesmOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
