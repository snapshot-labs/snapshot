<template>
  <PluginSafeSnapPreviewContractInteraction
    v-if="transaction.type === 'contractInteraction'"
    :removable="removable"
    :transaction="transaction"
    @remove="remove"
  />
  <PluginSafeSnapPreviewTransactionOld
    v-else
    :removable="removable"
    :transaction="transaction"
    @remove="remove"
  />
</template>

<script>
export default {
  props: ['transaction', 'removable'],
  emits: ['remove'],
  methods: {
    remove() {
      this.$emit('remove');
    }
  }
};
</script>
