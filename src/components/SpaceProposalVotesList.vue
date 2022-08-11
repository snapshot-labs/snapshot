<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue';
import { shorten, getChoiceString } from '@/helpers/utils';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import pending from '@/helpers/pending.json';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

import { useProfiles, useWeb3, useIntl } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  votes: Vote[];
  loaded: boolean;
  strategies: SpaceStrategy[];
  userVote: Vote[];
  loadingMore: boolean;
}>();

defineEmits(['loadVotes']);

const format = getChoiceString;

const { formatCompactNumber } = useIntl();
const { votes } = toRefs(props);
const { web3Account } = useWeb3();

const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);

const isFinalProposal = computed(() => {
  const spaceShowPending = pending;
  const showPending =
    props.proposal.scores_state === 'pending' &&
    spaceShowPending.includes(props.space.id);
  return props.proposal.scores_state === 'final' || showPending;
});

const voteCount = computed(() =>
  isFinalProposal.value ? props.proposal.votes : votes.value.length
);
const nbrVisibleVotes = ref(10);

const sortedVotes = ref<Vote[]>([]);

const visibleVotes = computed(() =>
  isFinalProposal.value
    ? sortedVotes.value
    : sortedVotes.value.slice(0, nbrVisibleVotes.value)
);
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

watch([votes, web3Account], () => {
  const votesWithUser = uniqBy(
    clone(votes.value).concat(props.userVote),
    'ipfs' as any
  );
  if (votesWithUser.map(vote => vote.voter).includes(web3Account.value)) {
    votesWithUser.unshift(
      votesWithUser.splice(
        votesWithUser.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
  } else {
    votesWithUser.sort((a, b) => b.balance - a.balance);
  }
  sortedVotes.value = votesWithUser;
});

watch(visibleVotes, () => {
  loadProfiles(visibleVotes.value.map(vote => vote.voter));
});
</script>

<template>
  <BaseBlock
    v-if="isZero()"
    :title="$t('votes')"
    :counter="voteCount"
    :slim="true"
    :loading="!loaded"
  >
    <div
      v-for="(vote, i) in visibleVotes"
      :key="i"
      :class="[
        'flex items-center border-t px-3 py-[14px]',
        { '!border-0': i === 0 }
      ]"
    >
      <BaseUser
        :key="vote.voter"
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
        :proposal="proposal"
        width-class="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px] text-left"
      />
      <div class="flex-auto truncate px-2 text-center text-skin-link">
        <div
          v-tippy="{
            content: format(proposal, vote.choice)
          }"
          class="truncate text-center text-skin-link"
        >
          {{ format(proposal, vote.choice) }}
        </div>
      </div>

      <div
        class="flex min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:min-w-[130px]"
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
      </div>
    </div>
    <a
      v-if="
        isFinalProposal
          ? sortedVotes.length < voteCount
          : sortedVotes.length > 10 && nbrVisibleVotes < sortedVotes.length
      "
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="isFinalProposal ? $emit('loadVotes') : (nbrVisibleVotes += 10)"
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
