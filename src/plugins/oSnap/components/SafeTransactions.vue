<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { getIpfsUrl, shorten } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import Plugin, {
EIP3770_PREFIXES,
createBatch,
getGnosisSafeBalances,
getGnosisSafeCollectibles
} from '../index';
import { Network } from '../types';
import FormImportTransactionsButton from './Form/ImportTransactionsButton.vue';
import FormTransactionBatch from './Form/TransactionBatch.vue';
import HandleOutcomeUma from './HandleOutcomeUma.vue';
import Tooltip from './Tooltip.vue';

const plugin = new Plugin();

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

function formatBatches(network, module, batches, multiSend) {
  if (batches.length) {
    const batchSample = batches[0];
    if (Array.isArray(batchSample)) {
      const chainId = parseInt(network);
      return batches.map((txs, index) =>
        createBatch(module, chainId, index, txs, multiSend)
      );
    }
  }
  return batches;
}

const props = defineProps<{
  modelValue: any;
  proposal: Proposal;
  space: ExtendedSpace;
  results: any;
  network: Network;
  moduleAddress: string;
  multiSendAddress: string;
  preview: boolean;
  hash: string;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(
  formatBatches(
    props.network,
    undefined,
    props.modelValue,
    props.multiSendAddress
  )
);
const gnosisSafeAddress = ref<string>();
const moduleAddress = ref<string>();
const showHash = ref(false);
const transactionConfig = ref({
  preview: props.preview,
  gnosisSafeAddress: undefined,
  moduleAddress: props.moduleAddress,
  network: props.network,
  multiSendAddress: props.multiSendAddress,
  tokens: [],
  collectables: []
});

const safeLink = computed(() => {
  const prefix = EIP3770_PREFIXES[props.network];
  return `https://gnosis-safe.io/app/${prefix}:${gnosisSafeAddress.value}`;
});

const networkName = computed(() => {
  if (props.network === '1') return 'Mainnet';
  const { shortName, name } = networks[props.network] || {};
  return shortName || name || `#${props.network}`;
});

const networkIcon = computed(() => {
  const { logo } = networks[props.network];
  return getIpfsUrl(logo);
});

const proposalResolved = computed(() => {
  const ts = Number((Date.now() / 1e3).toFixed());
  return ts > props.proposal.end;
});

function addTransactionBatch() {
  input.value.push(
    createBatch(
      props.moduleAddress,
      parseInt(props.network),
      input.length.value,
      [],
      props.multiSendAddress
    )
  );
  emit('update:modelValue', input.value);
}

function removeBatch(index) {
  input.value.splice(index, 1);
  emit('update:modelValue', input);
}

function updateTransactionBatch(index, batch) {
  input.value[index] = batch;
  emit('update:modelValue', input.value);
}

function handleImport(txs) {
  input.value.push(
    createBatch(
      props.moduleAddress,
      parseInt(props.network),
      input.value.length,
      txs,
      props.multiSendAddress
    )
  );
  emit('update:modelValue', input.value);
}
onMounted(async () => {
  try {
    const { dao } = await plugin.getModuleDetails(
      props.network,
      props.moduleAddress
    );
    gnosisSafeAddress.value = dao;
    transactionConfig.value = {
      ...transactionConfig,
      gnosisSafeAddress: gnosisSafeAddress.value,
      tokens: await fetchBalances(props.network, gnosisSafeAddress.value),
      collectables: await fetchCollectibles(
        props.network,
        gnosisSafeAddress.value
      )
    };
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
      <Tooltip
        :module-address="moduleAddress"
        :multi-send-address="multiSendAddress"
      />
    </h4>
    <UiCollapsibleText
      v-if="hash"
      :show-arrow="true"
      :open="showHash"
      :text="hash"
      class="border-b"
      style="border-width: 0 0 1px 0 !important"
      title="Complete Transaction Hash"
      @toggle="showHash = !showHash"
    />
    <div class="text-center">
      <div
        v-for="(batch, index) in input"
        :key="index"
        class="border-b last:border-b-0"
      >
        <FormTransactionBatch
          :config="transactionConfig"
          :model-value="batch"
          :nonce="index"
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>

      <div v-if="!preview || proposalResolved">
        <BaseButton v-if="!preview" class="my-3" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </BaseButton>

        <FormImportTransactionsButton
          v-if="!preview"
          :network="network"
          @import="handleImport($event)"
        />

        <HandleOutcomeUma
          :batches="input"
          :proposal="proposal"
          :space="space"
          :results="results"
          :module-address="moduleAddress"
          :multi-send-address="multiSendAddress"
          :network="transactionConfig.network"
        />
      </div>
    </div>
  </div>
</template>
