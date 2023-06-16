<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { web3Account } = useWeb3();
const {
  profiles,
  userPrioritizedVotes,
  loadingVotes,
  loadVotes,
  loadUserVote
} = useProposalVotes(props.proposal, 6);

const modalVotesmOpen = ref(false);

const voteCount = computed(() => props.proposal.votes);

const { downloadVotes, isDownloadingVotes, downloadProgress } =
  useReportDownload();

onMounted(async () => {
  await loadVotes();
});

watch(web3Account, loadUserVote, { immediate: true });
</script>

<template>
  <BaseBlock
    v-if="proposal.votes > 0"
    :title="$t('votes')"
    :counter="voteCount"
    :loading="loadingVotes"
    slim
  >
    <template
      v-if="props.proposal.state === 'closed' && proposal.votes < 50000"
      #button
    >
      <BaseButtonIcon
        v-if="!isDownloadingVotes"
        v-tippy="{ content: $t('proposal.downloadCsvVotes') }"
        @click="downloadVotes(proposal.id, proposal.space.id)"
      >
        <i-ho-download />
      </BaseButtonIcon>
      <div v-else class="flex">
        <LoadingSpinner v-if="downloadProgress < 1" :small="true" />
        <template v-else>
          {{ $t('proposal.preparingCsvVotes') }}…
          <BaseProgressRadial class="my-1 ml-2" :value="downloadProgress" />
        </template>
      </div>
    </template>
    <SpaceProposalVotesListItem
      v-for="(vote, i) in userPrioritizedVotes.slice(0, 6)"
      :key="i"
      :vote="vote"
      :profiles="profiles"
      :space="space"
      :proposal="proposal"
      :class="{ '!border-0': i === 0 }"
      :data-testid="`proposal-votes-list-item-${i}`"
    />
    <a
      v-if="userPrioritizedVotes.length < voteCount"
      tabindex="0"
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="modalVotesmOpen = true"
      @keypress="modalVotesmOpen = true"
    >
      <span v-text="$t('seeMore')" />
    </a>
    <teleport to="#modal">
      <SpaceProposalVotesModal
        :space="space"
        :proposal="proposal"
        :open="modalVotesmOpen"
        @close="modalVotesmOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
