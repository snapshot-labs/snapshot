<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useSafesnap } from '@/composables/useSafesnap';
import chevronIcon from '@/assets/icons/chevron.svg';
import Plugin from '@/../snapshot-plugins/src/plugins/safeSnap';

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
      transactions: [],
      hashHidden: true,
      blockHash: '',
      chevronIcon
    };
  },
  async mounted() {
    if (this.modelValue) this.transactions = clone(this.modelValue);
    if (!this.config.preview && !this.transactions.length)
      this.addTransaction();
    if (this.config.preview) {
      const safeSnap = new Plugin();
      const chainId = parseInt(this.config.network);
      const hashes = await safeSnap.calcTransactionHashes(
        chainId,
        this.config.realityAddress,
        this.modelValue
      );
      this.blockHash = hashes.length
        ? '0x' + hashes.map(h => h.substr(2)).join('')
        : '';
    }
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
    },
    toggleHash() {
      this.hashHidden = !this.hashHidden;
    }
  }
};
</script>
<style scoped>
.rotate {
  transform: rotate(180deg);
}
</style>

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
  <div v-if="config.preview" class="p-3 text-left border-t">
    <div class="flex" @click="toggleHash">
      <h4 class="inline-block" style="line-height: 1">View Transaction Hash</h4>
      <div class="flex-grow"></div>
      <img
        :src="chevronIcon"
        alt="arrow"
        v-bind:class="{ rotate: hashHidden }"
      />
    </div>
    <div v-if="!hashHidden">
      <p
        class="my-3"
        style="max-width: 350px; font-size: 16px; line-height: 18px"
      >
        Compare this hash to the hash on the Reality proposal to verify the
        transactions are the same.
      </p>
      <div
        class="p-3 mb-2 bg-gray-200 text-black border-gray-400 border"
        style="border-radius: 8px; overflow-wrap: break-word"
      >
        {{ blockHash }}
      </div>
    </div>
  </div>
</template>
