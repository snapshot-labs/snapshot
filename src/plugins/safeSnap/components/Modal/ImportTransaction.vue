<script setup lang="ts">
import SafeSnapFormImportTransactions from '../Form/ImportTransactions.vue';
type ModalImportTransactionProps = {
  open: boolean;
  network: string;
};

const props = defineProps<ModalImportTransactionProps>();
const emit = defineEmits(['close']);

const handleTxs = (txs: any) => {
  emit('close', txs);
};
</script>

<template>
  <BaseModal :open="props.open" @close="$emit('close')">
    <template #header>
      <h3>Add Transaction Batch with JSON</h3>
    </template>
    <div class="mx-0 my-4 min-h-[339px] md:mx-4">
      <SafeSnapFormImportTransactions :network="network" @import="handleTxs" />
    </div>
  </BaseModal>
</template>
