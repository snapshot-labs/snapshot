<script>
import Plugin, {
  createBatch,
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '@/../snapshot-plugins/src/plugins/safeSnap';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { shorten } from '@/helpers/utils';

const plugin = new Plugin();

const EIP3770_PREFIXES = {
  1: 'eth',
  56: 'bnb',
  4: 'rin',
  100: 'gno',
  246: 'ewt',
  73799: 'vt',
  42161: 'arb1',
  137: 'MATIC'
};

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
  setup() {
    return { shorten };
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
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${this.network}.png`;
    },
    proposalResolved() {
      const ts = (Date.now() / 1e3).toFixed();
      return ts > this.proposal.end;
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
  <div class="border-t border-b md:border rounded-none md:rounded-md mb-4">
    <h4
      class="px-4 pt-3 border-b block rounded-t-none md:rounded-t-md flex"
      style="padding-bottom: 12px"
    >
      <UiAvatar
        class="mr-2 float-left"
        :imgsrc="networkIcon"
        :seed="network"
        size="28"
      />
      {{ networkName }} Safe
      <a
        v-if="gnosisSafeAddress"
        :href="safeLink"
        class="text-color ml-2"
        style="font-weight: normal"
        target="_blank"
      >
        {{ shorten(gnosisSafeAddress) }}
        <i class="iconfont iconexternal-link" />
      </a>
      <div class="flex-grow"></div>
      <PluginSafeSnapTooltip
        :realityAddress="this.realityAddress"
        :multiSendAddress="this.multiSendAddress"
      ></PluginSafeSnapTooltip>
    </h4>
    <UiCollapsibleText
      v-if="hash"
      :showArrow="true"
      :open="showHash"
      class="border-b"
      style="border-width: 0 0 1px 0 !important"
      title="Complete Transaction Hash"
      @toggle="showHash = !showHash"
    >
      {{ hash }}
    </UiCollapsibleText>
    <div class="text-center">
      <div v-for="(batch, index) in input" v-bind:key="index" class="border-b">
        <PluginSafeSnapFormTransactionBatch
          :config="transactionConfig"
          :modelValue="batch"
          :nonce="index"
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>

      <div v-if="!preview || proposalResolved">
        <UiButton class="my-3" v-if="!preview" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </UiButton>

        <PluginSafeSnapFormImportTransactionsButton
          v-if="!preview"
          :network="this.network"
          @import="handleImport($event)"
        />

        <PluginSafeSnapHandleOutcome
          v-if="preview && proposalResolved"
          :batches="input"
          :proposalId="proposal.id"
          :realityAddress="realityAddress"
          :multiSendAddress="transactionConfig.multiSendAddress"
          :network="transactionConfig.network"
        />
      </div>
    </div>
  </div>
</template>
