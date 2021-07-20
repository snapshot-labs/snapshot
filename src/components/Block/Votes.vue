<script setup>
import { ref, computed, watch, toRefs, defineProps } from 'vue';
import { useStore } from 'vuex';
import { getChoiceString } from '@/helpers/utils';
import { useProfiles } from '@/composables/useProfiles';

const props = defineProps({
  space: Object,
  proposal: Object,
  votes: Object,
  loaded: Boolean,
  strategies: Object
});

const store = useStore();

const format = getChoiceString;

const { votes } = toRefs(props);

const showAllVotes = ref(false);
const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);

const web3Account = computed(() => store.state.web3.account);

const visibleVotes = computed(() =>
  showAllVotes.value ? sortVotesUserFirst() : sortVotesUserFirst().slice(0, 10)
);
const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol)
);

function isZero() {
  if (!props.loaded) return true;
  if (props.votes.length > 0) return true;
}

function openReceiptModal(vote) {
  authorIpfsHash.value = vote.id;
  // this.relayerIpfsHash = vote.relayerIpfsHash;
  modalReceiptOpen.value = true;
}

function sortVotesUserFirst() {
  const votes = props.votes;
  if (votes.map(vote => vote.voter).includes(web3Account.value)) {
    votes.unshift(
      votes.splice(
        votes.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
    return votes;
  }
  return votes;
}

const { profiles, addressArray } = useProfiles();

watch(votes, () => {
  addressArray.value = votes.value.map(vote => vote.voter);
});
</script>

<template>
  <Block
    v-if="isZero()"
    :title="$t('votes')"
    :counter="votes.length"
    :slim="true"
    :loading="!loaded"
  >
    <div
      v-for="(vote, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-top d-flex"
    >
      <User
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
        class="column"
      />
      <div class="flex-auto text-center text-white">
        <span
          :aria-label="format(proposal, vote.choice)"
          class="
            text-center text-white
            tooltipped tooltipped-multiline tooltipped-n
          "
        >
          {{ _shorten(format(proposal, vote.choice), 24) }}
        </span>
      </div>

      <div class="column text-right text-white">
        <span
          class="tooltipped tooltipped-multiline tooltipped-n"
          :aria-label="
            vote.scores
              .map((score, index) => `${_n(score)} ${titles[index]}`)
              .join(' + ')
          "
        >
          {{ `${_n(vote.balance)} ${_shorten(space.symbol, 'symbol')}` }}
        </span>
        <a
          @click="openReceiptModal(vote)"
          target="_blank"
          class="ml-2 text-gray"
          title="Receipt"
        >
          <Icon name="signature" />
        </a>
      </div>
    </div>
    <a
      v-if="!showAllVotes && votes.length > 10"
      @click="showAllVotes = true"
      class="
        px-4
        py-3
        border-top
        text-center
        d-block
        header-bg
        rounded-bottom-0 rounded-md-bottom-2
      "
    >
      {{ $t('seeMore') }}
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
