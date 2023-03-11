<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue';
import { shorten } from '@/helpers/utils';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

import {
  useProfiles,
  useWeb3,
  useIntl,
  useReportDownload
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  votes: Vote[];
  loaded: boolean;
  strategies: SpaceStrategy[];
  userVote: Vote | null;
  loadingMore: boolean;
}>();

defineEmits(['loadVotes']);

const { formatCompactNumber } = useIntl();
const { votes } = toRefs(props);
const { web3Account } = useWeb3();

const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);

const voteCount = computed(() => props.proposal.votes);

const sortedVotes = computed(() => {
  const votesClone = clone(votes.value);
  if (props.userVote) votesClone.push(props.userVote);
  const uniqVotes = uniqBy(votesClone, 'ipfs' as any);
  if (uniqVotes.map(vote => vote.voter).includes(web3Account.value)) {
    uniqVotes.unshift(
      uniqVotes.splice(
        uniqVotes.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
  } else {
    uniqVotes.sort((a, b) => b.balance - a.balance);
  }
  return uniqVotes;
});

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

function isZero() {
  if (!props.loaded) return true;
  if (votes.value.length > 0) return true;
}

function openReceiptModal(iphsHash) {
  authorIpfsHash.value = iphsHash;
  modalReceiptOpen.value = true;
}

const { profiles, loadProfiles } = useProfiles();

watch(sortedVotes, () => {
  loadProfiles(sortedVotes.value.map(vote => vote.voter));
});

const { downloadVotes, isDownloadingVotes } = useReportDownload();
</script>

<template>
  <BaseBlock
    v-if="isZero()"
    :title="$t('votes')"
    :counter="voteCount"
    :loading="!loaded"
    slim
  >
    <template v-if="props.proposal.state === 'closed'" #button>
      <BaseButtonIcon>
        <LoadingSpinner v-if="isDownloadingVotes" />
        <i-ho-download
          v-else
          v-tippy="{ content: 'Download as CSV' }"
          @click="downloadVotes(proposal.id, proposal.space.id)"
        />
      </BaseButtonIcon>
    </template>
    <div
      v-for="(vote, i) in sortedVotes"
      :key="i"
      :class="[
        'flex items-center border-t px-3 py-[14px]',
        { '!border-0': i === 0 }
      ]"
      :data-testid="`proposal-votes-list-item-${i}`"
    >
      <BaseUser
        :key="vote.voter"
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
        :proposal="proposal"
        width-class="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px] text-left"
      />

      <SpaceProposalVotesListItemChoice :proposal="proposal" :vote="vote" />
      <div
        class="flex w-[110px] min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:w-[130px] xs:min-w-[130px]"
      >
        <span
          v-tippy="{
            content: vote.scores
              ?.map(
                (score, index) =>
                  `${formatCompactNumber(score)} ${titles[index]}`
              )
              .join(' + ')
          }"
        >
          {{
            `${formatCompactNumber(vote.balance)} ${shorten(
              proposal.symbol || space.symbol,
              'symbol'
            )}`
          }}
        </span>
        <BaseButtonIcon @click="openReceiptModal(vote.ipfs)">
          <BaseIcon name="signature" />
        </BaseButtonIcon>
        <BaseButtonIcon
          v-if="vote.reason !== '' && props.proposal.privacy !== 'shutter'"
          v-tippy="{
            content: vote.reason
          }"
          class="cursor-default p-0"
        >
          <i-ho-annotation class="text-[16px]" />
        </BaseButtonIcon>
      </div>
    </div>
    <a
      v-if="sortedVotes.length < voteCount"
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="$emit('loadVotes')"
    >
      <LoadingSpinner v-if="loadingMore" />
      <span v-else v-text="$t('seeMore')" />
    </a>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        :author-ipfs-hash="authorIpfsHash"
        @close="modalReceiptOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
