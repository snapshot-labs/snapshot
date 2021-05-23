<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 class="mb-3">Transactions</h4>
      <PluginSafeSnapTransactionForm
        :input="input"
        :nonce="input.txs.length"
        :network="network"
        @close="adding = false"
        @newTransaction="addTransaction($event)"
        v-if="adding"
      />
      <div v-else>
        <div
          v-for="(tx, i) in input.txs"
          :key="i"
          class="mb-3 p-4 border rounded-2 text-white text-center"
        >
          <PluginSafeSnapTransactionPreview :transaction="tx" />
          <UiButton v-if="input" @click="removeTx(i)" class="width-full mb-2">
            Remove
          </UiButton>
        </div>
        <UiButton @click="adding = true" class="width-full mb-2">
          Add
        </UiButton>
        <UiButton @click="handleSubmit" class="button--submit width-full">
          Confirm
        </UiButton>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  props: ['modelValue', 'proposal', 'network'],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      input: { txs: [] },
      adding: false
    };
  },
  mounted() {
    if (this.modelValue) return (this.input = this.modelValue);
  },
  methods: {
    addTransaction(transaction) {
      this.input.txs.push(transaction);
      this.adding = false;
    },
    removeTx(index) {
      if (!this.input || !this.input.txs || this.input.txs.length <= index)
        return;
      this.input.txs.splice(index, 1);
      // After removing an tx we need to correct the nonces
      this.input.txs.forEach((tx, index) => {
        tx.nonce = index;
      });
    },
    handleSubmit() {
      this.$emit('update:modelValue', this.input);
      this.$emit('close');
    }
  }
};
</script>
