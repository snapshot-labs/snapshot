<script setup lang="ts">
import { getModuleDetails } from '@/plugins/safeSnap/utils/realityModule';
import { createBatch } from '@/plugins/safeSnap/utils';
import { EIP3770_PREFIXES } from '@/plugins/safeSnap/constants';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';

import SafeSnapTooltip from './Tooltip.vue';
import SafeSnapHandleOutcome from './HandleOutcome.vue';
import SafeSnapFormTransactionBatch from './Form/TransactionBatch.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { getSafeBalances, getSafeCollectables } from '@/helpers/safe';

const props = defineProps<{
  proposal: Proposal;
  safe: {
    network: string;
    realityAddress: string;
    multiSendAddress: string;
    batches: any[];
    hash: string;
  };
}>();

function formatBatches(network, realityModule, batches, multiSend) {
  if (batches.length) {
    const batchSample = batches[0];
    if (Array.isArray(batchSample)) {
      const chainId = parseInt(network);
      return batches.map((txs, index) =>
        createBatch(realityModule, chainId, index, txs, multiSend)
      );
    }
  }
  return batches;
}

const input = ref(
  formatBatches(
    props.safe.network,
    props.safe.realityAddress,
    props.safe.batches,
    props.safe.multiSendAddress
  )
);
const gnosisSafeAddress = ref<string>('');
const showHash = ref(false);
const transactionConfig = reactive({
  gnosisSafeAddress: gnosisSafeAddress.value,
  realityAddress: props.safe.realityAddress,
  network: props.safe.network,
  multiSendAddress: props.safe.multiSendAddress,
  tokens: [],
  collectables: []
});

async function fetchBalances() {
  if (gnosisSafeAddress.value) {
    try {
      const balances = await getSafeBalances(
        props.safe.network,
        gnosisSafeAddress.value
      );
      return balances
        .filter(balance => balance.token)
        .map(balance => ({
          ...balance.token,
          address: balance.tokenAddress
        }));
    } catch (e) {
      console.warn('Error fetching balances');
    }
  }
  return [];
}

async function fetchCollectibles() {
  if (gnosisSafeAddress.value) {
    try {
      return await getSafeCollectables(
        props.safe.network,
        gnosisSafeAddress.value
      );
    } catch (error) {
      console.warn('Error fetching collectables');
    }
  }
  return [];
}

const safeLink = computed(() => {
  const prefix = EIP3770_PREFIXES[props.safe.network];
  return `https://gnosis-safe.io/app/${prefix}:${gnosisSafeAddress.value}`;
});

const networkName = computed(() => {
  if (props.safe.network === '1') return 'Mainnet';
  const { shortName, name } = networks[props.safe.network] || {};
  return shortName || name || `#${props.safe.network}`;
});

const networkIcon = computed(() => {
  const { logo } = networks[props.safe.network];
  return getIpfsUrl(logo);
});

onMounted(async () => {
  try {
    const { dao } = await getModuleDetails(
      props.safe.network,
      props.safe.realityAddress
    );
    gnosisSafeAddress.value = dao;
    transactionConfig.gnosisSafeAddress = gnosisSafeAddress.value;
    transactionConfig.tokens = await fetchBalances();
    transactionConfig.collectables = await fetchCollectibles();
  } catch (e) {
    console.error(e);
  }
});

const proposalResolved = computed(() => Date.now() / 1e3 > props.proposal.end);
</script>

<template>
  <div>
    <h4
      class="flex rounded-t-none border-b px-4 pt-3 pb-[12px] md:rounded-t-md"
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
      <SafeSnapTooltip
        :reality-address="safe.realityAddress"
        :multi-send-address="safe.multiSendAddress"
      />
    </h4>
    <UiCollapsibleText
      v-if="safe.hash"
      :show-arrow="true"
      :open="showHash"
      class="border-b"
      style="border-width: 0 0 1px 0 !important"
      title="Complete Transaction Hash"
      @toggle="showHash = !showHash"
    >
      {{ safe.hash }}
    </UiCollapsibleText>
    <div class="text-center">
      <div
        v-for="(batch, index) in input"
        :key="index"
        class="border-b last:border-b-0"
      >
        <SafeSnapFormTransactionBatch
          :config="transactionConfig"
          :model-value="batch"
          :nonce="index"
        />
      </div>

      <SafeSnapHandleOutcome
        v-if="proposalResolved"
        :batches="input"
        :proposal="proposal"
        :reality-address="safe.realityAddress"
        :network="transactionConfig.network"
      />
    </div>
  </div>
</template>
