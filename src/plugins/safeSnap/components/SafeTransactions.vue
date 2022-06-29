<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import Plugin, {
  createBatch,
  EIP3770_PREFIXES,
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '../index';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';

import SafeSnapTooltip from './Tooltip.vue';
import SafeSnapHandleOutcome from './HandleOutcome.vue';
import SafeSnapFormImportTransactionsButton from './Form/ImportTransactionsButton.vue';
import SafeSnapFormTransactionBatch from './Form/TransactionBatch.vue';
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  modelValue: any;
  proposal: Proposal;
  network: string;
  realityAddress: string;
  multiSendAddress: string;
  preview: boolean;
  hash: string;
}>();

const emit = defineEmits(['update:modelValue']);

const plugin = new Plugin();
const input = ref(
  formatBatches(
    props.network,
    props.realityAddress,
    props.modelValue,
    props.multiSendAddress
  )
);
const gnosisSafeAddress = ref<string | undefined>(undefined);
const showHash = ref(false);
const transactionConfig = reactive<{
  preview: boolean;
  gnosisSafeAddress: string | undefined;
  realityAddress: string;
  network: string;
  multiSendAddress: string;
  tokens: string[];
  collectables: string[];
}>({
  preview: props.preview,
  gnosisSafeAddress: undefined,
  realityAddress: props.realityAddress,
  network: props.network,
  multiSendAddress: props.multiSendAddress,
  tokens: [],
  collectables: []
});

async function fetchBalances(network, gnosisSafeAddress) {
  if (gnosisSafeAddress) {
    try {
      const balances = await getGnosisSafeBalances(network, gnosisSafeAddress);
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

function formatBatches(network, realityModule, batches, multiSend): any[] {
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

function addTransactionBatch() {
  input.value.push(
    createBatch(
      props.realityAddress,
      parseInt(props.network),
      input.value.length,
      [],
      props.multiSendAddress
    )
  );
  emit('update:modelValue', input.value);
}

function removeBatch(index) {
  input.value.splice(index, 1);
  emit('update:modelValue', input.value);
}

function updateTransactionBatch(index, batch) {
  input.value[index] = batch;
  emit('update:modelValue', input.value);
}

function handleImport(txs) {
  input.value.push(
    createBatch(
      props.realityAddress,
      parseInt(props.network),
      input.value.length,
      txs,
      props.multiSendAddress
    )
  );
  emit('update:modelValue', input.value);
}

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
  const ts = Date.now() / 1e3;
  return ts > props.proposal.end;
});

onMounted(async () => {
  try {
    const { dao } = await plugin.getModuleDetails(
      props.network,
      props.realityAddress
    );
    gnosisSafeAddress.value = dao;

    transactionConfig.gnosisSafeAddress = gnosisSafeAddress.value;
    transactionConfig.tokens = await fetchBalances(
      props.network,
      gnosisSafeAddress.value
    );
    transactionConfig.collectables = await fetchCollectibles(
      props.network,
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
      class="flex rounded-t-none border-b px-4 pt-3 md:rounded-t-md"
      style="padding-bottom: 12px"
    >
      <BaseAvatar class="float-left mr-2" :src="networkIcon" size="28" />
      {{ networkName }} Safe
      <a
        v-if="gnosisSafeAddress"
        :href="safeLink"
        class="ml-2 text-skin-text"
        style="font-weight: normal"
        target="_blank"
      >
        {{ shorten(gnosisSafeAddress) }}
        <i class="iconfont iconexternal-link" />
      </a>
      <div class="flex-grow"></div>
      <SafeSnapTooltip
        :reality-address="realityAddress"
        :multi-send-address="multiSendAddress"
      />
    </h4>
    <UiCollapsibleText
      v-if="hash"
      :show-arrow="true"
      :open="showHash"
      class="border-b"
      style="border-width: 0 0 1px 0 !important"
      title="Complete Transaction Hash"
      @toggle="showHash = !showHash"
    >
      {{ hash }}
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
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>

      <div v-if="!preview || proposalResolved">
        <BaseButton v-if="!preview" class="my-3" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </BaseButton>

        <SafeSnapFormImportTransactionsButton
          v-if="!preview"
          :network="network"
          @import="handleImport($event)"
        />

        <SafeSnapHandleOutcome
          v-if="preview && proposalResolved"
          :batches="input"
          :proposal="proposal"
          :reality-address="realityAddress"
          :multi-send-address="transactionConfig.multiSendAddress"
          :network="transactionConfig.network"
        />
      </div>
    </div>
  </div>
</template>
