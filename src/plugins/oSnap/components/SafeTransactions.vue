<script setup lang="ts">
import {
  ExtendedSpace,
  Proposal,
  Results,
  TreasuryWallet
} from '@/helpers/interfaces';
import { getIpfsUrl, shorten } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import {
  EIP3770_PREFIXES,
  getGnosisSafeBalances,
  getGnosisSafeCollectibles,
  getModuleDetails
} from '../index';
import { NFT, Network, Token, Transaction as TTransaction } from '../types';
import { getModuleAddressForTreasury } from '../utils/umaModule';
import Transaction from './Form/Transaction.vue';
import HandleOutcomeUma from './HandleOutcomeUma.vue';
import Tooltip from './Tooltip.vue';

const props = defineProps<{
  transactions: TTransaction[];
  treasury: TreasuryWallet;
  proposal: Proposal;
  space: ExtendedSpace;
  results?: Results;
  preview: boolean;
}>();

const emit = defineEmits<{
  addTransaction: [
    {
      treasury: TreasuryWallet;
      moduleAddress: string;
      tokens: Token[];
      collectables: NFT[];
      transaction: TTransaction;
    }
  ];
  removeTransaction: [safeAddress: string, transactionIndex: number];
  updateTransaction: [
    safeAddress: string,
    transaction: TTransaction,
    transactionIndex: number
  ];
}>();

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

function fetchTokens(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data.verifiedTokens?.tokens || data.tokens || [];
    })
    .catch(() => []);
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

async function fetchCollectibles(network, gnosisSafeAddress) {
  if (gnosisSafeAddress) {
    try {
      return await getGnosisSafeCollectibles(network, gnosisSafeAddress);
    } catch (error) {
      console.warn('Error fetching collectables');
    }
  }
  return [];
}

const gnosisSafeAddress = ref<string>();
const moduleAddress = ref<string>();
const tokens = ref<Token[]>([]);
const collectables = ref<NFT[]>([]);

const safeLink = computed(() => {
  const prefix = EIP3770_PREFIXES[props.treasury.network];
  return `https://gnosis-safe.io/app/${prefix}:${gnosisSafeAddress.value}`;
});

const networkName = computed(() => {
  if (props.treasury.network === '1') return 'Mainnet';
  const { shortName, name } = networks[props.treasury.network] || {};
  return shortName || name || `#${props.treasury.network}`;
});

const networkIcon = computed(() => {
  const { logo } = networks[props.treasury.network];
  return getIpfsUrl(logo);
});

const proposalResolved = computed(() => {
  const ts = Number((Date.now() / 1e3).toFixed());
  return ts > props.proposal.end;
});

onMounted(async () => {
  try {
    moduleAddress.value = await getModuleAddressForTreasury(
      props.treasury.network as Network,
      props.treasury.address
    );
    gnosisSafeAddress.value = (
      await getModuleDetails(
        props.treasury.network as Network,
        moduleAddress.value
      )
    ).gnosisSafeAddress;
    tokens.value = await fetchBalances(
      props.treasury.network as Network,
      gnosisSafeAddress.value
    );
    collectables.value = await fetchCollectibles(
      props.treasury.network,
      gnosisSafeAddress.value
    );
  } catch (e) {
    console.error(e);
  }
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
        v-if="gnosisSafeAddress"
        :href="safeLink"
        class="ml-2 flex font-normal text-skin-text"
        target="_blank"
      >
        {{ shorten(gnosisSafeAddress) }}
        <i-ho-external-link class="ml-1" />
      </a>
      <div class="flex-grow"></div>
      <Tooltip :module-address="moduleAddress" />
    </h4>
    <div class="text-center" v-if="!!moduleAddress && !!gnosisSafeAddress">
      <Transaction
        v-for="(transaction, index) in transactions"
        :key="index"
        :transaction="transaction"
        :transaction-index="index"
        :preview="preview"
        :safe-address="gnosisSafeAddress"
        :module-address="moduleAddress"
        :tokens="tokens"
        :collectables="collectables"
        :network="(props.treasury.network as Network)"
        @update-transaction="(...args) => emit('updateTransaction', ...args)"
        @remove-transaction="(...args) => emit('removeTransaction', ...args)"
      />
    </div>

    <div v-if="(!preview || proposalResolved) && !!moduleAddress">
      <BaseButton v-if="!preview" class="my-3" @click="emit('addTransaction', {
        treasury,
        moduleAddress,
        tokens,
        collectables,
        transaction: {
          type: 'raw',
          to: '',
          value: '0',
          data: '0x',
          nonce,
          formatted: ['', 0, '0', '0x']
        }
      })">
        Add Transaction
      </BaseButton>

      <HandleOutcomeUma
        :batches="input"
        :proposal="proposal"
        :space="space"
        :results="results"
        :module-address="moduleAddress"
        :network="treasury.network"
      />
    </div>
  </div>
</template>
