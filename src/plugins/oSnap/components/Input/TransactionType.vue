<script setup lang="ts">
import { TransactionType } from '../../types';
import ModalTransactionType from '../TransactionBuilder/ModalTransactionType.vue';

defineProps<{
  selectedTransactionType: TransactionType;
}>();

const emit = defineEmits<{
  updateTransactionType: [type: TransactionType];
}>();

const isModalOpen = ref(false);

const transactionTypesWithDetails: {
  type: TransactionType;
  title: string;
  description: string;
  hidden?: boolean;
}[] = [
  {
    type: 'transferFunds',
    title: 'Send tokens',
    description: 'Transfer funds to another address'
  },
  {
    type: 'transferNFT',
    title: 'Send NFT',
    description: 'Transfer a collectible to another address'
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
  },
  {
    type: 'safeImport',
    title: 'Import Safe file',
    description:
      'Import JSON file exported from Gnosis Safe transaction builder',
    hidden: true
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
