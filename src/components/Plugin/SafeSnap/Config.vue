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
    if (this.modelValue) {
      this.input = clone(this.modelValue);
      if (!this.input.txs) this.input.txs = [];
      this.batches =
        this.input.txs[0] && !Array.isArray(this.input.txs[0])
          ? [this.input.txs]
          : this.input.txs;
      // this.batches = [
      //   [
      //     {
      //       to: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
      //       abi: [
      //         {
      //           name: 'transfer',
      //           type: 'function',
      //           action: 'write',
      //           inputs: [
      //             { name: 'to', type: 'address[]' },
      //             { name: 'tokens', type: 'uint256[]' }
      //           ],
      //           outputs: [{ name: 'success', type: 'bool' }],
      //           payable: false,
      //           constant: false,
      //           stateMutability: 'nonpayable'
      //         }
      //       ],
      //       data:
      //         'ffc3a7690000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000002a378cf62c12888a970804ce3d734e0ba543b29c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
      //       type: 'contractInteraction',
      //       nonce: '0',
      //       value: '0',
      //       operation: '0'
      //     }
      //   ]
      // ];
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
      this.input.txs = this.batches;
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>
