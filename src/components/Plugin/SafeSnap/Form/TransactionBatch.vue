<script>
import { clone } from '@/helpers/utils';
import { useSafesnap } from '@/composables/useSafesnap';

export default {
  props: ['modelValue', 'index', 'nonce', 'config'],
  emits: ['update:modelValue', 'remove'],
  setup() {
    const { safesnap } = useSafesnap();
    return { safesnap };
  },
  data() {
    return {
      open: true,
      transactions: []
    };
  },
  mounted() {
    if (this.modelValue) this.transactions = clone(this.modelValue);
    if (!this.config.preview && !this.transactions.length)
      this.addTransaction();
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
      if (!this.transactions.length) {
        this.$emit('remove');
      }
    }
  }
};
</script>

<template>
  <UiCollapsible
    borderless
    :hideRemove="config.preview"
    :number="index + 1"
    :open="open"
    :title="`${$t('safeSnap.batch')} (${transactions.length})`"
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
        :config="config"
        :nonce="`${nonce + index}`"
        @remove="removeTransaction(index)"
        @update:modelValue="updateTransaction(index, $event)"
      />
    </div>

    <Block
      v-if="safesnap.batchError && index === safesnap.batchError.num"
      class="mt-4"
      style="border-color: red !important"
    >
      <Icon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> Error: {{ safesnap.batchError.message }}</span>
    </Block>

    <UiButton v-if="!config.preview" @click="addTransaction">
      {{ $t('safeSnap.addTransaction') }}
    </UiButton>
  </UiCollapsible>
</template>
