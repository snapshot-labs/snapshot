<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { shorten, getChoiceString } from '@/helpers/utils';
import { useProfiles } from '@/composables/useProfiles';
import { useWeb3 } from '@/composables/useWeb3';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import { useIntl } from '@/composables/useIntl';

const props = defineProps({
  space: Object,
  proposal: Object,
  votes: Array,
  loaded: Boolean,
  strategies: Object,
  userVote: Array,
  loadingMore: Boolean
});

defineEmits(['loadVotes']);

const format = getChoiceString;

const { formatCompactNumber } = useIntl();
const { votes } = toRefs(props);
const { web3Account } = useWeb3();

const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);

const isFinalProposal = computed(() => props.proposal.scores_state === 'final');

const voteCount = computed(() =>
  isFinalProposal.value ? props.proposal.votes : votes.value.length
);
const nbrVisibleVotes = ref(10);

const sortedVotes = ref([]);

const visibleVotes = computed(() =>
  isFinalProposal.value
    ? sortedVotes.value
    : sortedVotes.value.slice(0, nbrVisibleVotes.value)
);
const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol)
);

function isZero() {
  if (!props.loaded) return true;
  if (votes.value.length > 0) return true;
}

function openReceiptModal(vote) {
  authorIpfsHash.value = vote.ipfs;
  // this.relayerIpfsHash = vote.relayerIpfsHash;
  modalReceiptOpen.value = true;
}

const { profiles, loadProfiles } = useProfiles();

watch([votes, web3Account], () => {
  const votesWithUser = uniqBy(clone(votes.value).concat(props.userVote), 'id');
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
  <Block
    v-if="isZero()"
    :title="$t('votes')"
    :counter="voteCount"
    :slim="true"
    :loading="!loaded"
  >
    <div
      v-for="(vote, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-t flex"
    >
      <User
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
        :proposal="proposal"
        class="w-[110px] xs:w-[130px] min-w-[110px] xs:min-w-[130px]"
      />
      <div class="flex-auto text-center link-color truncate px-3">
        <div
          class="text-center link-color truncate"
          v-tippy="{
            content:
              format(proposal, vote.choice).length > 24
                ? format(proposal, vote.choice)
                : null
          }"
        >
          {{ format(proposal, vote.choice) }}
        </div>
      </div>

      <div
        class="min-w-[110px] xs:min-w-[130px] text-right link-color whitespace-nowrap"
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
              space.symbol,
              'symbol'
            )}`
          }}
        </span>
        <a
          @click="openReceiptModal(vote)"
          target="_blank"
          class="ml-2 text-color"
          title="Receipt"
        >
          <Icon name="signature" />
        </a>
      </div>
    </div>
    <a
      v-if="
        isFinalProposal
          ? sortedVotes.length < voteCount
          : sortedVotes.length > 10 && nbrVisibleVotes < sortedVotes.length
      "
      @click="isFinalProposal ? $emit('loadVotes') : (nbrVisibleVotes += 10)"
      class="px-4 py-3 border-t text-center block header-bg rounded-b-none md:rounded-b-md"
    >
      <UiLoading v-if="loadingMore" :fill-white="primary" />
      <span v-else v-text="$t('seeMore')" />
    </a>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        @close="modalReceiptOpen = false"
        :authorIpfsHash="authorIpfsHash"
      />
    </teleport>
  </Block>
</template>
