<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { getIpfsUrl } from '@/helpers/utils';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { formatEther, formatUnits } from '@ethersproject/units';
import HandleOutcome from './components/HandleOutcome/HandleOutcome.vue';
import ReadOnly from './components/Input/ReadOnly.vue';
import SafeLinkWithAvatar from './components/SafeLinkWithAvatar.vue';
import { GnosisSafe, Transaction } from './types';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
}>();
const ipfs = getIpfsUrl(props.proposal.ipfs) as string;
const safe = props.proposal.plugins.oSnap?.safe as GnosisSafe;
const transactionsForDisplay = enrichTransactionsForDisplay(safe.transactions);

function enrichTransactionsForDisplay(transactions: Transaction[]) {
  return transactions.map(enrichTransactionForDisplay);
}

function enrichTransactionForDisplay(transaction: Transaction) {
  const { to, value, data } = transaction;
  const commonProperties = { to, value: formatEther(value), data };
  if (transaction.type === 'raw') {
    return { ...commonProperties, type: 'Raw' };
  }
  if (transaction.type === 'contractInteraction') {
    const { methodName, parameters } = transaction;
    return {
      ...commonProperties,
      type: 'Contract interaction',
      'method name': methodName,
      parameters: parameters?.join(', ')
    };
  }
  if (transaction.type === 'transferFunds') {
    const { token, amount: unformattedAmount } = transaction;
    const amount =
      isBigNumberish(unformattedAmount) && !!token?.decimals
        ? formatUnits(unformattedAmount, token.decimals)
        : unformattedAmount;
    return {
      ...commonProperties,
      type: 'Transfer funds',
      'token address':
        token?.address === 'main' ? 'native token' : token?.address,
      'token symbol': token?.symbol,
      recipient: transaction.recipient,
      amount
    };
  }
  if (transaction.type === 'transferNFT') {
    const { recipient, collectable } = transaction;
    return {
      ...commonProperties,
      type: 'Transfer NFT',
      recipient,
      collectable: `${collectable?.tokenName} #${collectable?.id}`,
      'collectable address': collectable?.address
    };
  }
  return { ...commonProperties, type: 'Raw' };
}
</script>

<template>
  <template v-if="safe.transactions.length > 0">
    <h2 class="mb-4 text-lg">oSnap Transactions</h2>
    <h3 class="flex text-md">
      <SafeLinkWithAvatar :safe="safe" />
    </h3>
    <div>
      <BaseLink v-if="ipfs" :link="ipfs">View transactions on IPFS</BaseLink>
      <div
        v-for="({ type, ...details }, index) in transactionsForDisplay"
        class="my-4"
      >
        <h4 class="mb-2">Transaction #{{ index + 1 }} — {{ type }}</h4>
        <ReadOnly v-for="[key, value] in Object.entries(details)" class="mb-2">
          <strong class="mr-4 inline-block whitespace-nowrap">{{ key }}</strong>
          <span class="break-all">{{ value }}</span>
        </ReadOnly>
      </div>
    </div>
    <HandleOutcome
      v-if="!!results"
      :space="space"
      :proposal="proposal"
      :transactions="safe.transactions"
      :results="results"
      :module-address="safe.moduleAddress"
      :network="safe.network"
    />
  </template>
  <template v-else>
    <p>There are no transactions associated with this proposal.</p>
  </template>
</template>
