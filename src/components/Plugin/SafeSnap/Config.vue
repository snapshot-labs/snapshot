<template>
  <Block title="SafeSnap Plugin">
    <div v-if="preview">
      <h4 class="mb-3">Transactions</h4>
      <PluginSafeSnapPreviewTransaction
        v-for="(tx, index) in input.txs"
        v-bind:key="index"
        :transaction="tx"
      />
    </div>
    <div v-else class="text-center">
      <div v-for="(batch, index) in batches" v-bind:key="index" class="mb-4">
        <PluginSafeSnapFormTransactionBatch
          :modelValue="batch"
          :index="index"
          :network="network"
          :nonce="getBatchNonce(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
          @remove="removeBatch(index)"
        />
      </div>
      <UiButton @click="createTransactionBatch">
        Add Transaction Batch
      </UiButton>
    </div>
  </Block>
</template>

<script>
import { clone } from '@/helpers/utils';

export default {
  props: ['modelValue', 'proposal', 'network', 'preview'],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      input: { txs: [] },
      batches: []
    };
  },
  mounted() {
    console.log('preview', this.preview);
    if (this.modelValue) {
      this.input = clone(this.modelValue);
      if (!this.input.txs) this.input.txs = [];
      this.batches = this.input.txs.length ? [this.input.txs] : [];
    }
  },
  methods: {
    createTransactionBatch() {
      this.batches.push([]);
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
      this.input.txs = this.batches.flat();
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>
