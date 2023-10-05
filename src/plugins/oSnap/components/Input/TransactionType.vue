<script setup lang="ts">
import {
  TransactionType as TTransactionType,
  TransactionType
} from '../../types';
import ModalTransactionType from '../TransactionBuilder/ModalTransactionType.vue';

defineProps<{
  selectedTransactionType: TTransactionType;
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  updateTransactionType: [type: TTransactionType];
}>();

const isModalOpen = ref(false);

const transactionTypesWithDetails: {
  type: TransactionType;
  title: string;
  description: string;
}[] = [
  {
    type: 'transferFunds',
    title: 'Transfer funds',
    description: 'Transfer funds to another address'
  },
  {
    type: 'transferNFT',
    title: 'Transfer collectable',
    description: 'Transfer a collectable to another address'
  },
  {
    type: 'contractInteraction',
    title: 'Contract interaction',
    description: 'Interact with a smart contract'
  },
  {
    type: 'raw',
    title: 'Raw transaction',
    description: 'Send a raw transaction'
  }
];
</script>

<template>
  <div class="mb-2">
    <TuneButtonSelect
      :model-value="
        transactionTypesWithDetails.find(
          typeAndDetails => typeAndDetails.type === selectedTransactionType
        )?.title || 'Select transaction type'
      "
      :disabled="isReadOnly"
      :tooltip="!isReadOnly ? 'Select the transaction type' : null"
      @select="isModalOpen = true"
    />
    <teleport to="#modal">
      <ModalTransactionType
        :selected="selectedTransactionType"
        :open="isModalOpen"
        :transaction-types-with-details="transactionTypesWithDetails"
        @update-transaction-type="emit('updateTransactionType', $event)"
        @close="isModalOpen = false"
      />
    </teleport>
  </div>
</template>
