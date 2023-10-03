<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { getIpfsUrl, shorten } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { EIP3770_PREFIXES } from '../constants';
import { NFT, Network, Transaction as TTransaction, Token } from '../types';
import Transaction from './Form/Transaction.vue';
import HandleOutcomeUma from './HandleOutcomeUma.vue';
import Tooltip from './Tooltip.vue';

const props = defineProps<{
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
  transactions: TTransaction[];
  proposal: Proposal;
  space: ExtendedSpace;
  results?: Results;
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  addTransaction: [transaction: TTransaction];
  removeTransaction: [transactionIndex: number];
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
}>();

const safeLink = computed(() => {
  const prefix = EIP3770_PREFIXES[props.network];
  return `https://gnosis-safe.io/app/${prefix}:${props.safeAddress}`;
});

const networkName = computed(() => {
  if (props.network === '1') return 'Mainnet';
  const networkDetails = networks[props.network];
  if ('shortName' in networkDetails) return networkDetails.shortName;
  return networkDetails.name;
});

const networkIcon = computed(() => {
  const { logo } = networks[props.network];
  return getIpfsUrl(logo);
});

const proposalResolved = computed(() => {
  const ts = Number((Date.now() / 1e3).toFixed());
  return ts > props.proposal.end;
});
</script>

<template>
  <div>
    <h4
      class="flex rounded-t-none border-b px-4 pb-[12px] pt-3 md:rounded-t-md"
    >
      <BaseAvatar class="float-left mr-2" :src="networkIcon" size="28" />
      {{ networkName }} Safe
      <a
        v-if="safeAddress"
        :href="safeLink"
        class="ml-2 flex font-normal text-skin-text"
        target="_blank"
      >
        {{ shorten(safeAddress) }}
        <i-ho-external-link class="ml-1" />
      </a>
      <div class="flex-grow"></div>
      <Tooltip :module-address="moduleAddress" />
    </h4>
    <div class="text-center">
      <Transaction
        v-for="(transaction, index) in transactions"
        :key="index"
        :transaction="transaction"
        :transaction-index="index"
        :is-read-only="isReadOnly"
        :safe-address="safeAddress"
        :module-address="moduleAddress"
        :tokens="tokens"
        :collectables="collectables"
        :network="props.network"
        @update-transaction="(...args) => emit('updateTransaction', ...args)"
        @remove-transaction="(...args) => emit('removeTransaction', ...args)"
      />
    </div>

    <div v-if="!isReadOnly || proposalResolved">
      <BaseButton
        v-if="!isReadOnly"
        class="my-3"
        @click="
          emit('addTransaction', {
            type: 'raw',
            to: '',
            value: '0',
            data: '0x',
            formatted: ['', 0, '0', '0x']
          })
        "
      >
        Add Transaction
      </BaseButton>

      <HandleOutcomeUma
        v-if="isReadOnly"
        :space="space"
        :proposal="proposal"
        :transactions="transactions"
        :results="results"
        :module-address="moduleAddress"
        :network="network"
      />
    </div>
  </div>
</template>
