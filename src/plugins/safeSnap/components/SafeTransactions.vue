<script>
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

const plugin = new Plugin();

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

export default {
  components: {
    SafeSnapTooltip,
    SafeSnapFormImportTransactionsButton,
    SafeSnapHandleOutcome,
    SafeSnapFormTransactionBatch
  },
  props: [
    'modelValue',
    'proposal',
    'network',
    'realityAddress',
    'multiSendAddress',
    'preview',
    'hash'
  ],
  emits: ['update:modelValue'],
  setup() {
    return { shorten };
  },
  data() {
    return {
      input: formatBatches(
        this.network,
        this.realityAddress,
        this.modelValue,
        this.multiSendAddress
      ),
      gnosisSafeAddress: undefined,
      showHash: false,
      transactionConfig: {
        preview: this.preview,
        gnosisSafeAddress: undefined,
        realityAddress: this.realityAddress,
        network: this.network,
        multiSendAddress: this.multiSendAddress,
        tokens: [],
        collectables: []
      }
    };
  },
  computed: {
    safeLink() {
      const prefix = EIP3770_PREFIXES[this.network];
      return `https://gnosis-safe.io/app/${prefix}:${this.gnosisSafeAddress}`;
    },
    networkName() {
      if (this.network === '1') return 'Mainnet';
      const { shortName, name } = networks[this.network] || {};
      return shortName || name || `#${this.network}`;
    },
    networkIcon() {
      const { logo } = networks[this.network];
      return getIpfsUrl(logo);
    },
    proposalResolved() {
      const ts = (Date.now() / 1e3).toFixed();
      return ts > this.proposal.end;
    }
  },
  async mounted() {
    try {
      const { dao } = await plugin.getModuleDetails(
        this.network,
        this.realityAddress
      );
      this.gnosisSafeAddress = dao;
      this.transactionConfig = {
        ...this.transactionConfig,
        gnosisSafeAddress: this.gnosisSafeAddress,
        tokens: await fetchBalances(this.network, this.gnosisSafeAddress),
        collectables: await fetchCollectibles(
          this.network,
          this.gnosisSafeAddress
        )
      };
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    addTransactionBatch() {
      this.input.push(
        createBatch(
          this.realityAddress,
          parseInt(this.network),
          this.input.length,
          [],
          this.multiSendAddress
        )
      );
      this.$emit('update:modelValue', this.input);
    },
    removeBatch(index) {
      this.input.splice(index, 1);
      this.$emit('update:modelValue', this.input);
    },
    updateTransactionBatch(index, batch) {
      this.input[index] = batch;
      this.$emit('update:modelValue', this.input);
    },
    handleImport(txs) {
      this.input.push(
        createBatch(
          this.realityAddress,
          parseInt(this.network),
          this.input.length,
          txs,
          this.multiSendAddress
        )
      );
      this.$emit('update:modelValue', this.input);
    }
  }
};
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
