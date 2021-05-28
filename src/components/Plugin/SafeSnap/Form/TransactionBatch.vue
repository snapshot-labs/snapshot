<template>
  <UiCollapsible
    title="Multiple transactions"
    :number="index + 1"
    :open="open"
    @toggle="open = !open"
    @remove="$emit('remove')"
  >
    <div
      v-for="(transaction, index) in transactions"
      v-bind:key="index"
      class="mb-2"
    >
      <PluginSafeSnapFormTransaction
        :modelValue="transaction"
        :index="index"
        :network="network"
        :nonce="nonce + index"
        @update:modelValue="updateTransaction(index, $event)"
        @remove="removeTransaction(index)"
      />
    </div>
    <UiButton @click="addTransaction"> Add Transaction </UiButton>
  </UiCollapsible>
</template>

<script>
import { clone } from '@/helpers/utils';

export default {
  props: ['modelValue', 'index', 'nonce', 'network'],
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
