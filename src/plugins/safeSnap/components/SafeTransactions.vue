<script setup lang="ts">
import Plugin from '../index';
import { createBatch } from '@/plugins/safeSnap/utils';
import { EIP3770_PREFIXES } from '@/plugins/safeSnap/constants';
import {
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '@/plugins/safeSnap/utils/safe';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';

import SafeSnapTooltip from './Tooltip.vue';
import SafeSnapFormImportTransactionsButton from './Form/ImportTransactionsButton.vue';
import SafeSnapFormTransactionBatch from './Form/TransactionBatch.vue';
import { computed, onMounted, reactive, ref } from 'vue';

const plugin = new Plugin();

const props = defineProps([
  'modelValue',
  'proposal',
  'network',
  'realityAddress',
  'multiSendAddress',
  'hash'
]);

const emit = defineEmits(['update:modelValue']);

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
    props.network,
    props.realityAddress,
    props.modelValue,
    props.multiSendAddress
  )
);
const gnosisSafeAddress = ref<string>('');
const showHash = ref(false);
const transactionConfig = reactive({
  gnosisSafeAddress: gnosisSafeAddress.value,
  realityAddress: props.realityAddress,
  network: props.network,
  multiSendAddress: props.multiSendAddress,
  tokens: [],
  collectables: []
});

async function fetchBalances() {
  if (gnosisSafeAddress.value) {
    try {
      const balances = await getGnosisSafeBalances(
        props.network,
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
      return await getGnosisSafeCollectibles(
        props.network,
        gnosisSafeAddress.value
      );
    } catch (error) {
      console.warn('Error fetching collectables');
    }
  }
  return [];
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

onMounted(async () => {
  try {
    const { dao } = await plugin.getModuleDetails(
      props.network,
      props.realityAddress
    );
    gnosisSafeAddress.value = dao;
    transactionConfig.gnosisSafeAddress = gnosisSafeAddress.value;
    transactionConfig.tokens = await fetchBalances();
    transactionConfig.collectables = await fetchCollectibles();
  } catch (e) {
    console.error(e);
  }
});

const addTransactionBatch = () => {
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
};

const removeBatch = index => {
  input.value.splice(index, 1);
  emit('update:modelValue', input.value);
};

const updateTransactionBatch = (index, batch) => {
  input.value[index] = batch;
  emit('update:modelValue', input.value);
};

const handleImport = txs => {
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
};
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

      <div>
        <BaseButton class="my-3" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </BaseButton>

        <SafeSnapFormImportTransactionsButton
          :network="network"
          @import="handleImport($event)"
        />
      </div>
    </div>
  </div>
</template>
