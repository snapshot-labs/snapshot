<template>
  <UiCollapsible
    :hideRemove="preview"
    :number="index + 1"
    :open="open"
    title="Multiple transactions"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <div
      v-for="(transaction, index) in transactions"
      v-bind:key="index"
      class="mb-2"
    >
      <PluginSafeSnapFormTransaction
        :index="index"
        :modelValue="transaction"
        :network="network"
        :nonce="`${nonce + index}`"
        :preview="preview"
        @remove="removeTransaction(index)"
        @update:modelValue="updateTransaction(index, $event)"
      />
    </div>
    <UiButton v-if="!preview" @click="addTransaction">
      Add Transaction
    </UiButton>
  </UiCollapsible>
</template>

<script>
import { clone } from '@/helpers/utils';

export default {
  props: ['modelValue', 'index', 'nonce', 'network', 'preview'],
  emits: ['update:modelValue', 'remove'],
  data() {
    return {
      open: true,
      transactions: []
    };
  },
  mounted() {
    if (this.modelValue) this.transactions = clone(this.modelValue);
    if (!this.transactions.length) this.addTransaction();
  },
  methods: {
    addTransaction() {
      this.transactions.push(undefined);
    },
    updateTransaction(index, transaction) {
      this.transactions[index] = transaction;
      this.$emit('update:modelValue', this.transactions);
    },
    removeTransaction(index) {
      this.transactions.splice(index, 1);
      this.$emit('update:modelValue', this.transactions);
    }
  }
};
</script>
