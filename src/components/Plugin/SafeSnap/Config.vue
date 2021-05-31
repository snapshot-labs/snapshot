<template>
  <Block title="SafeSnap Plugin">
    <div class="text-center">
      <div v-for="(batch, index) in batches" v-bind:key="index" class="mb-4">
        <PluginSafeSnapFormTransactionBatch
          :preview="preview"
          :modelValue="batch"
          :index="index"
          :network="network"
          :nonce="getBatchNonce(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
          @remove="removeBatch(index)"
        />
      </div>
      <UiButton v-if="!preview" @click="createTransactionBatch">
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
      input: { txs: [], valid: true },
      batches: []
    };
  },
  mounted() {
    if (this.modelValue) {
      this.input = clone(this.modelValue);
      if (!this.input.txs) this.input.txs = [];
      this.batches =
        this.input.txs[0] && !Array.isArray(this.input.txs[0])
          ? [this.input.txs]
          : this.input.txs;
      this.updateModel();
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
      if (this.preview) return;
      this.input.txs = this.batches;
      this.input.valid = this.input.txs.flat().every(tx => tx);
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>
