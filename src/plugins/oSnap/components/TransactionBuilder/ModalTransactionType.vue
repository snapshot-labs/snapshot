<script setup lang="ts">
import { TransactionType } from '../../types';

defineProps<{
  open: boolean;
  selected: TransactionType;
  transactionTypesWithDetails: {
    type: TransactionType;
    title: string;
    description: string;
  }[];
}>();

const emit = defineEmits<{
  updateTransactionType: [type: TransactionType];
  close: [];
}>();

function select(type: TransactionType) {
  emit('updateTransactionType', type);
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Select transaction type</h3>
    </template>
    <div class="mx-0 my-4 flex flex-col space-y-3 md:mx-4">
      <button
        v-for="(typeAndDetails, key) in transactionTypesWithDetails"
        :key="key"
        @click="select(typeAndDetails.type)"
      >
        <BaseModalSelectItem
          :selected="typeAndDetails.type === selected"
          :title="typeAndDetails.title"
          :description="typeAndDetails.description"
        />
      </button>
    </div>
  </BaseModal>
</template>
