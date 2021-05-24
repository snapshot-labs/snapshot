<template>
  <PluginSafeSnapPreviewContractInteraction
    v-if="transaction.type === 'contractInteraction'"
    :transaction="transaction"
    @remove="remove"
  />
  <PluginSafeSnapPreviewTransactionOld
    v-else
    :transaction="transaction"
    @remove="remove"
  />
</template>

<script>
export default {
  props: ['transaction'],
  emits: ['remove'],
  methods: {
    remove() {
      this.$emit('remove');
    }
  }
};
</script>
