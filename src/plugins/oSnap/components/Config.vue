<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

import {
  ExtendedSpace,
  Proposal,
  Results,
  TreasuryWallet
} from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { cloneDeep } from 'lodash';
import {
  GnosisSafe,
  NFT,
  Network,
  OsnapPluginData,
  Token,
  Transaction
} from '../types';
import {
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '../utils/safe';
import {
  getIsOsnapEnabled,
  getModuleAddressForTreasury
} from '../utils/umaModule';
import SafeTransactions from './SafeTransactions.vue';

const props = defineProps<{
  pluginData: OsnapPluginData;
  proposal: Proposal;
  space: ExtendedSpace;
  isProposal: boolean;
  results?: Results;
}>();

const emit = defineEmits<{
  update: [pluginData: OsnapPluginData];
}>();

const newPluginData = ref(cloneDeep(props.pluginData));

const safes = ref<GnosisSafe[]>([]);

const ipfs = getIpfsUrl(props.proposal.ipfs) as string;

function addTransaction(transaction: Transaction) {
  if (props.isProposal || newPluginData.value.safe === null) return;
  newPluginData.value.safe.transactions.push(transaction);
  emit('update', newPluginData.value);
}

function removeTransaction(transactionIndex: number) {
  if (props.isProposal || !newPluginData.value.safe) return;

  newPluginData.value.safe.transactions.splice(transactionIndex, 1);
  emit('update', newPluginData.value);
}

function updateTransaction(transaction: Transaction, transactionIndex: number) {
  if (props.isProposal || !newPluginData.value.safe) return;

  newPluginData.value.safe.transactions[transactionIndex] = transaction;
  emit('update', newPluginData.value);
}

async function fetchBalances(network: Network, safeAddress: string) {
  if (!safeAddress) {
    return [];
  }

  try {
    const balances = await getGnosisSafeBalances(network, safeAddress);

    const uniswapTokensPromise = fetchTokens(
      'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    );
    const snapshotTokensPromise = fetchTokens(
      `${import.meta.env.VITE_SIDEKICK_URL}/api/moderation?list=verifiedTokens`
    );

    const tokensLists = await Promise.all([
      uniswapTokensPromise,
      snapshotTokensPromise
    ]);
    const tokens = tokensLists.flat();

    return sortBalances(enhanceBalances(balances, tokens));
  } catch (e) {
    console.warn('Error fetching balances');
    return [];
  }
}

function enhanceBalances(balances, tokens) {
  return balances
    .filter(balance => balance.token)
    .map(balance => enhanceBalance(balance, tokens));
}

function enhanceBalance(balance, tokens) {
  const verifiedToken = getVerifiedToken(balance.tokenAddress, tokens);
  return {
    ...balance.token,
    address: balance.tokenAddress,
    balance: balance.balance
      ? formatUnits(balance.balance, balance.token.decimals)
      : 0,
    verified: !!verifiedToken,
    chainId: verifiedToken ? verifiedToken.chainId : undefined
  };
}

function getVerifiedToken(tokenAddress, tokens) {
  return tokens.find(
    token => token.address.toLowerCase() === tokenAddress.toLowerCase()
  );
}

function sortBalances(balances) {
  return balances.sort((a, b) => b.verified - a.verified);
}

async function fetchTokens(url: string): Promise<Token[]> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.verifiedTokens?.tokens || data.tokens || [];
  } catch {
    return [];
  }
}

async function fetchCollectibles(
  network: Network,
  gnosisSafeAddress: string
): Promise<NFT[]> {
  try {
    return await getGnosisSafeCollectibles(network, gnosisSafeAddress);
  } catch (error) {
    console.warn('Error fetching collectables');
  }
  return [];
}

async function createSafes() {
  const treasuriesWithOsnapEnabled = (
    await Promise.all(
      props.space.treasuries.map(async treasury => {
        const isOsnapEnabled = await getIsOsnapEnabled(
          treasury.network as Network,
          treasury.address
        );
        return isOsnapEnabled ? treasury : null;
      })
    )
  ).filter(treasury => treasury !== null) as TreasuryWallet[];

  const safes: GnosisSafe[] = await Promise.all(
    treasuriesWithOsnapEnabled.map(async treasury => {
      const moduleAddress = await getModuleAddressForTreasury(
        treasury.network as Network,
        treasury.address
      );
      const tokens: Token[] = await fetchBalances(
        treasury.network as Network,
        treasury.address
      );
      const collectables = await fetchCollectibles(
        treasury.network as Network,
        treasury.address
      );
      return {
        safeName: treasury.name,
        safeAddress: treasury.address,
        network: treasury.network as Network,
        transactions: [] as Transaction[],
        moduleAddress,
        tokens,
        collectables
      };
    })
  );

  return safes;
}

function updateSafe(safeIndex: string) {
  newPluginData.value.safe = cloneDeep(safes.value[safeIndex]);
  emit('update', newPluginData.value);
}

onMounted(async () => {
  safes.value = await createSafes();

  if (props.pluginData.safe !== null) {
    const safe = safes.value.find(
      safe => safe.safeAddress === props.pluginData.safe?.safeAddress
    );
    if (safe) {
      newPluginData.value.safe = safe;
    }
  } else {
    newPluginData.value.safe = safes.value[0];
  }
  emit('update', newPluginData.value);
});
</script>

<template>
  <div
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
    <UiSelect
      :model-value="safes.findIndex(safe => safe.safeAddress === newPluginData.safe?.safeAddress)"
      @update:modelValue="updateSafe"
    >
      <template #label>Safe</template>
      <option v-for="(safe, index) in safes" :key="index" :value="index">
        {{ safe.safeName }}
      </option>
    </UiSelect>
    <div class="border-b last:border-b-0">
      <SafeTransactions
        v-if="!!newPluginData.safe"
        :is-proposal="isProposal"
        :proposal="proposal"
        :space="space"
        :results="results"
        :safe-address="newPluginData.safe.safeAddress"
        :module-address="newPluginData.safe.moduleAddress"
        :tokens="newPluginData.safe.tokens"
        :collectables="newPluginData.safe.collectables"
        :network="newPluginData.safe.network"
        :transactions="newPluginData.safe.transactions"
        @add-transaction="addTransaction"
        @remove-transaction="removeTransaction"
        @update-transaction="updateTransaction"
      />
    </div>
  </div>
</template>
