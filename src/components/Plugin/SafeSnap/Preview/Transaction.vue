<template>
  <PluginSafeSnapPreviewContractInteraction
    v-if="transaction.type === 'contractInteraction'"
    :transaction="transaction"
  />
  <PluginSafeSnapPreviewTransactionOld v-else :transaction="transaction" />
</template>

<script>
export default {
  props: ['transaction']
};
</script>
