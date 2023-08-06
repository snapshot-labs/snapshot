<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import camelCase from 'lodash/camelCase';

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

const showModalDownloadMessage = ref(false);
const { downloadVotes, isDownloadingVotes, errorCode } = useReportDownload();

async function downloadReport(proposalId: string) {
  const response = await downloadVotes(proposalId);

  if (!response) {
    showModalDownloadMessage.value = true;
  }
}

const errorMessagekeyPrefix = computed(() => {
  const knownErrors = ['PENDING_GENERATION', 'UNSUPPORTED_ENV'];

  return `proposal.downloadCsvVotes.postDownloadModal.message.${camelCase(
    knownErrors.includes(errorCode?.value?.message as string)
      ? errorCode?.value?.message
      : 'UNKNOWN_ERROR'
  )}`;
});

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
    <template v-if="props.proposal.state === 'closed'" #button>
      <BaseButtonIcon
        v-tippy="{ content: $t('proposal.downloadCsvVotes.title') }"
        :loading="isDownloadingVotes"
        @click="downloadReport(proposal.id)"
      >
        <i-ho-download />
      </BaseButtonIcon>
      <BaseModal
        :open="showModalDownloadMessage"
        @close="showModalDownloadMessage = false"
      >
        <template #header>
          <div class="flex flex-row items-center justify-center">
            <h3>
              {{ $t('proposal.downloadCsvVotes.postDownloadModal.title') }}
            </h3>
          </div>
        </template>

        <div class="m-4 text-center">
          <i-ho-clock
            v-if="errorCode?.message === 'PENDING_GENERATION'"
            class="mx-auto my-4 text-center text-[3em]"
          />
          <i-ho-exclamation
            v-else
            class="mx-auto my-4 text-center text-[3em] text-red"
          />
          <h3>
            {{ $t(`${errorMessagekeyPrefix}.title`) }}
          </h3>
          <p class="mt-3 italic">
            {{ $t(`${errorMessagekeyPrefix}.description`) }}
          </p>
        </div>

        <template #footer>
          <BaseButton
            class="w-full"
            primary
            @click="showModalDownloadMessage = false"
          >
            {{ $t('close') }}
          </BaseButton>
        </template>
      </BaseModal>
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
