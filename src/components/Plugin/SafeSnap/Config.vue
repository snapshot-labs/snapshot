<script>
import { clone } from '@/helpers/utils';
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import {
  getGnosisSafeBalances,
  getGnosisSafeCollecibles
} from '@/helpers/abi/utils';

export default {
  props: [
    'modelValue',
    'proposal',
    'network',
    'moduleAddress',
    'proposalId',
    'preview'
  ],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      input: { txs: [], valid: true },
      batches: [],
      plugin: new Plugin(),
      gnosisSafeAddress: undefined,
      proposalDetails: undefined,
      transactionConfig: {
        preview: this.preview,
        network: this.network,
        tokens: []
      }
    };
  },
  async mounted() {
    if (this.modelValue) {
      this.input = clone(this.modelValue);
      if (!this.input.txs) this.input.txs = [];
      this.batches =
        this.input.txs[0] && !Array.isArray(this.input.txs[0])
          ? [this.input.txs]
          : this.input.txs;
      this.updateModel();
    }

    try {
      const { dao } = await this.plugin.getModuleDetails(
        this.network,
        this.moduleAddress
      );
      this.gnosisSafeAddress = dao;
      this.transactionConfig = {
        ...this.transactionConfig,
        gnosisSafeAddress: this.gnosisSafeAddress,
        tokens: await this.fetchBalances(this.gnosisSafeAddress),
        collectables: await this.fetchCollectables(this.gnosisSafeAddress)
      };
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    createTransactionBatch() {
      this.batches.push([]);
    },
    getSafeLink() {
      if (this.network === '4') {
        return `https://rinkeby.gnosis-safe.io/app/#/safes/${this.gnosisSafeAddress}`;
      }
      return `https://gnosis-safe.io/app/#/safes/${this.gnosisSafeAddress}`;
    },
    removeBatch(index) {
      this.batches.splice(index, 1);
      this.updateModel();
    },
    getBatchNonce(index) {
      return this.batches
        .slice(0, index)
        .reduce((acc, transactions) => acc + transactions.length, 0);
    },
    updateTransactionBatch(index, batch) {
      this.batches[index] = batch;
      this.updateModel();
    },
    updateModel() {
      if (this.preview) return;
      this.input.txs = this.batches;
      this.input.valid = this.input.txs.flat().every(tx => tx);
      this.$emit('update:modelValue', this.input);
    },
    async fetchBalances(gnosisSafeAddress) {
      if (gnosisSafeAddress) {
        try {
          const balances = await getGnosisSafeBalances(
            this.network,
            gnosisSafeAddress
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
    },
    async fetchCollectables(gnosisSafeAddress) {
      if (gnosisSafeAddress) {
        try {
          return await getGnosisSafeCollecibles(
            this.network,
            gnosisSafeAddress
          );
        } catch (error) {
          console.warn('Error fetching collectables');
        }
      }
      return [];
    }
  }
};
</script>

<template>
  <div
    class="
      border-top border-bottom border-md
      rounded-0 rounded-md-2
      mb-4
      block-bg
    "
  >
    <h4
      class="
        px-4
        pt-3
        border-bottom
        d-block
        header-bg
        rounded-top-0 rounded-md-top-2
      "
      style="padding-bottom: 12px"
    >
      Transactions
      {{ gnosisSafeAddress && `(${_shorten(gnosisSafeAddress)})` }}
      <a
        v-if="gnosisSafeAddress"
        :href="getSafeLink()"
        class="text-color"
        style="padding-top: 2px"
        target="_blank"
      >
        <i
          class="iconfont iconexternal-link"
          style="font-size: 18px; line-height: 18px; vertical-align: middle"
        />
      </a>
    </h4>
    <div class="p-4 text-center">
      <div v-for="(batch, index) in batches" v-bind:key="index" class="mb-4">
        <PluginSafeSnapFormTransactionBatch
          :config="transactionConfig"
          :index="index"
          :modelValue="batch"
          :nonce="getBatchNonce(index)"
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>
      <UiButton v-if="!preview" @click="createTransactionBatch">
        Add transaction Batch
      </UiButton>
    </div>
  </div>
</template>
