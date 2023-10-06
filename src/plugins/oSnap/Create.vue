<script setup lang="ts">
import { ExtendedSpace, TreasuryWallet } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { cloneDeep } from 'lodash';
import TransactionBuilder from './components/TransactionBuilder/TransactionBuilder.vue';
import {
  BalanceResponse,
  GnosisSafe,
  NFT,
  Network,
  OsnapPluginData,
  Token,
  Transaction
} from './types';
import {
  getGnosisSafeBalances,
  getGnosisSafeCollectibles,
  getIsOsnapEnabled,
  getModuleAddressForTreasury
} from './utils';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const isLoading = ref(false);

const emit = defineEmits<{
  update: [value: { key: 'oSnap'; form: OsnapPluginData }];
}>();

const newPluginData = ref<OsnapPluginData>({
  safe: null
});

const safes = ref<GnosisSafe[]>([]);
const tokens = ref<Token[]>([]);
const collectables = ref<NFT[]>([]);

function addTransaction(transaction: Transaction) {
  if (newPluginData.value.safe === null) return;
  newPluginData.value.safe.transactions.push(transaction);
  update(newPluginData.value);
}

function removeTransaction(transactionIndex: number) {
  if (!newPluginData.value.safe) return;

  newPluginData.value.safe.transactions.splice(transactionIndex, 1);
  update(newPluginData.value);
}

function updateTransaction(transaction: Transaction, transactionIndex: number) {
  if (!newPluginData.value.safe) return;

  newPluginData.value.safe.transactions[transactionIndex] = transaction;
  update(newPluginData.value);
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

    return enhanceTokensWithBalances(balances, tokens);
  } catch (e) {
    console.warn('Error fetching balances');
    return [];
  }
}

function enhanceTokensWithBalances(
  balances: Partial<BalanceResponse>[],
  tokens: Token[]
) {
  return balances
    .filter(
      (balance): balance is BalanceResponse =>
        !!balance.token && !!balance.tokenAddress && !!balance.balance
    )
    .map(balance => enhanceTokenWithBalance(balance, tokens))
    .sort((a, b) => {
      if (a.verified && b.verified) return 0;
      if (a.verified) return -1;
      return 1;
    });
}

function enhanceTokenWithBalance(
  balance: BalanceResponse,
  tokens: Token[]
): Token {
  const verifiedToken = getVerifiedToken(balance.tokenAddress, tokens);
  return {
    ...balance.token,
    address: balance.tokenAddress,
    balance: balance.balance
      ? formatUnits(balance.balance, balance.token.decimals)
      : '0',
    verified: !!verifiedToken,
    chainId: verifiedToken ? verifiedToken.chainId : undefined
  };
}

function getVerifiedToken(tokenAddress: string, tokens: Token[]) {
  return tokens.find(
    token => token.address.toLowerCase() === tokenAddress.toLowerCase()
  );
}

async function fetchCollectibles(network: Network, gnosisSafeAddress: string) {
  try {
    const response = await getGnosisSafeCollectibles(
      network,
      gnosisSafeAddress
    );
    console.log('nfts', response);
    return response.results;
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
      return {
        safeName: treasury.name,
        safeAddress: treasury.address,
        network: treasury.network as Network,
        transactions: [] as Transaction[],
        moduleAddress,
      };
    })
  );

  return safes;
}

function updateSafe(safeIndex: string) {
  newPluginData.value.safe = cloneDeep(safes.value[safeIndex]);
  update(newPluginData.value);
}

const update = (newPluginData: OsnapPluginData) => {
  emit('update', { key: 'oSnap', form: newPluginData });
};

watch(newPluginData, async () => {
  if (!newPluginData.value.safe?.safeAddress) return;
  tokens.value = await fetchBalances(
    newPluginData.value.safe.network,
    newPluginData.value.safe.safeAddress
  );
  collectables.value = await fetchCollectibles(
    newPluginData.value.safe.network,
    newPluginData.value.safe.safeAddress
  );
});

onMounted(async () => {
  isLoading.value = true;
  safes.value = await createSafes();
  newPluginData.value.safe = safes.value[0];
  update(newPluginData.value);
  isLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading" class="grid min-h-[180px] place-items-center">
    <h1 class="text-center">
      Loading oSnap Safes <LoadingSpinner class="ml-2 inline" big />
    </h1>
  </div>
  <div v-else class="rounded-2xl border p-4">
    <div>
      <h2 class="text-md">Add oSnap transactions</h2>
    </div>
    <h3 class="text-base">Pick a safe</h3>
    <UiSelect
      :model-value="
        safes.findIndex(
          safe => safe.safeAddress === newPluginData.safe?.safeAddress
        )
      "
      @update:modelValue="updateSafe"
    >
      <template #label>Safe</template>
      <option v-for="(safe, index) in safes" :key="index" :value="index">
        {{ safe.safeName }}
      </option>
    </UiSelect>
    <div class="mt-4 border-b last:border-b-0">
      <TransactionBuilder
        v-if="!!newPluginData.safe"
        :space="space"
        :safe-address="newPluginData.safe.safeAddress"
        :module-address="newPluginData.safe.moduleAddress"
        :tokens="tokens"
        :collectables="collectables"
        :network="newPluginData.safe.network"
        :transactions="newPluginData.safe.transactions"
        @add-transaction="addTransaction"
        @remove-transaction="removeTransaction"
        @update-transaction="updateTransaction"
      />
    </div>
  </div>
</template>
