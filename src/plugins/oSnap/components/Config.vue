<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

import {
  ExtendedSpace,
  Proposal,
  Results,
  TreasuryWallet
} from '@/helpers/interfaces';
import { cloneDeep } from 'lodash';
import { NFT, Network, OsnapPluginData, Token, Transaction } from '../types';
import { getIsOsnapEnabled } from '../utils/umaModule';
import SafeTransactions from './SafeTransactions.vue';

const props = defineProps<{
  pluginData: OsnapPluginData;
  proposal: Proposal;
  space: ExtendedSpace;
  preview: boolean;
  results?: Results;
}>();

const emit = defineEmits<{
  update: [pluginData: OsnapPluginData];
}>();

const newPluginData = ref(cloneDeep(props.pluginData));

const treasuriesWithOsnapEnabled = ref<TreasuryWallet[]>([]);

const ipfs = getIpfsUrl(props.proposal.ipfs) as string;

function addTransaction(params: {
  treasury: TreasuryWallet;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  transaction: Transaction;
}) {
  if (props.preview) return;

  const { treasury, moduleAddress, tokens, collectables, transaction } = params;
  if (!newPluginData.value.safes[treasury.address]) {
    newPluginData.value.safes[treasury.address] = {
      safeName: treasury.name,
      safeAddress: treasury.address,
      network: treasury.network as Network,
      moduleAddress,
      tokens,
      collectables,
      transactions: []
    };
  }
  newPluginData.value.safes[treasury.address].transactions.push(transaction);
  emit('update', newPluginData.value);
}

function removeTransaction(safeAddress: string, transactionIndex: number) {
  if (props.preview) return;

  newPluginData.value.safes[safeAddress].transactions.splice(
    transactionIndex,
    1
  );
  emit('update', newPluginData.value);
}

function updateTransaction(safeAddress: string, transaction: Transaction, transactionIndex: number) {
  if (props.preview) return;

  newPluginData.value.safes[safeAddress].transactions[transactionIndex] = transaction;
  emit('update', newPluginData.value);
}

onMounted(async () => {
  props.space.treasuries.forEach(async treasury => {
    if (
      await getIsOsnapEnabled(treasury.network as Network, treasury.address)
    ) {
      treasuriesWithOsnapEnabled.value.push(treasury);
    }
  });
});
</script>

<template>
  <div
    v-if="!preview"
    class="mb-4 rounded-none border-b border-t bg-skin-block-bg md:rounded-xl md:border"
  >
    <div
      class="block border-b px-4 pt-3"
      style="
        padding-bottom: 12px;
        display: flex;
        justify-content: space-between;
      "
    >
      <h4>
        {{ $t('safeSnap.transactions') }}
      </h4>
      <BaseLink v-if="ipfs" :link="ipfs"> View Details </BaseLink>
    </div>

    <div
      v-for="treasury in treasuriesWithOsnapEnabled"
      :key="treasury.address"
      class="border-b last:border-b-0"
    >
      <SafeTransactions
        :preview="preview"
        :proposal="proposal"
        :space="space"
        :results="results"
        :treasury="treasury"
        :transactions="newPluginData.safes[treasury.address]?.transactions ?? []"
        @add-transaction="addTransaction"
        @remove-transaction="removeTransaction"
        @update-transaction="updateTransaction"
      />
    </div>
  </div>
</template>
