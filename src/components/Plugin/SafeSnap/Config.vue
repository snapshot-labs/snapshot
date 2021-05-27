<template>
  <Block title="SafeSnap Plugin">
    <form @submit.prevent="handleSubmit">
      <div class="text-center">
        <PluginSafeSnapFormTransaction
          v-if="adding"
          :input="input"
          :network="network"
          :nonce="input.txs.length"
          @close="adding = false"
          @newTransaction="addTransaction($event)"
        />
        <div v-else>
          <h4 class="mb-3">Transactions</h4>
          <div
            v-for="(tx, i) in input.txs"
            :key="i"
            class="mb-3 p-4 border rounded-2 text-white text-center"
          >
            <PluginSafeSnapTransactionPreview :transaction="tx" />
            <!-- TODO: Hide button if not creating -->
            <UiButton
              v-if="input && create"
              class="width-full mb-2"
              @click="removeTx(i)"
            >
              Remove
            </UiButton>
          </div>
          <UiButton v-if="create" class="width-full" @click="adding = true"
            >Add Transaction</UiButton
          >
        </div>
      </div>
    </form>
  </Block>
</template>

<script>
export default {
  props: ['modelValue', 'proposal', 'network', 'create'],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      input: { txs: [] },
      adding: false
    };
  },
  mounted() {
    if (this.modelValue) {
      this.input = this.modelValue;
      if (!this.input.txs) this.input.txs = [];
    }
  },
  methods: {
    addTransaction(transaction) {
      this.input.txs.push(transaction);
      this.adding = false;
      this.$emit('update:modelValue', this.input);
    },
    removeTx(index) {
      if (!this.input || !this.input.txs || this.input.txs.length <= index)
        return;
      this.input.txs.splice(index, 1);
      // After removing an tx we need to correct the nonces
      this.input.txs.forEach((tx, index) => {
        tx.nonce = index;
      });
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>
