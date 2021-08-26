<script>
import { clone } from '@/helpers/utils';
import { useSafesnap } from '../../../../composables/useSafesnap';

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
      if (!this.transactions.length) {
        this.$emit('remove');
      }
    }
  }
};
</script>

<template>
  <UiCollapsible
    :hideRemove="config.preview"
    :number="index + 1"
    :open="open"
    :title="`Batch #${index + 1}`"
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
    <div
      class="mt-4 batch-error"
      v-if="safesnap.batchError && index === safesnap.batchError.num"
    >
      <h4>Transaction Failed</h4>
      <div class="mt-2 batch-error-message-container">
        Error: {{ safesnap.batchError.message }}
      </div>
    </div>

    <UiButton v-if="!config.preview" @click="addTransaction">
      Add Transaction
    </UiButton>
  </UiCollapsible>
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'Calibre';
  src: url('../../../../assets/fonts/Calibre-Semibold.woff2') format('woff2'),
    url('../../../../assets/fonts/Calibre-Semibold.woff') format('woff'),
    url('../../../../assets/fonts/Calibre-Semibold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'Calibre-regular';
  src: url('../../../../assets/fonts/Calibre-Regular.woff2') format('woff2'),
    url('../../../../assets/fonts/Calibre-Regular.woff') format('woff'),
    url('../../../../assets/fonts/Calibre-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

.batch-error {
  border: 1px solid red;
  border-radius: 12px;
  padding: 16px 12px 12px 12px;
  text-align: left;
  font-family: 'Calibre-regular', 'Calibre', sans-serif;
}

.batch-error h4 {
  color: #ff3030;
  font-weight: normal;
  font-size: 18px;
  line-height: 18px;
}

.batch-error-message-container {
  color: #ff3030;
  font-size: 12px;
  font-weight: normal;
  font-family: 'Overpass Mono', 'Calibre', sans-serif;
  word-break: break-word;
  padding: 8px 8px 8px 12px;
  border-radius: 12px;
  background-color: rgba(255, 0, 0, 0.1);
}
</style>
