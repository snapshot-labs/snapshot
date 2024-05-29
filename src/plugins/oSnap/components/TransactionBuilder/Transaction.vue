<script setup lang="ts">
import {
  ContractInteractionTransaction,
  TransferNftTransaction,
  type NFT,
  type Network,
  type RawTransaction as TRawTransaction,
  type Transaction as TTransaction,
  type TransactionType as TTransactionType,
  type Token,
  type TransferFundsTransaction,
  SafeImportTransaction
} from '../../types';
import TransactionType from '../Input/TransactionType.vue';
import ContractInteraction from './ContractInteraction.vue';
import RawTransaction from './RawTransaction.vue';
import TransferFunds from './TransferFunds.vue';
import TransferNFT from './TransferNFT.vue';
import SafeImport from './SafeImport.vue';

const props = defineProps<{
  transaction: TTransaction;
  transactionIndex: number;
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
  removeTransaction: [transactionIndex: number];
}>();

function updateTransactionType(transactionType: TTransactionType) {
  emit(
    'updateTransaction',
    {
      type: transactionType,
      to: '',
      value: '0',
      data: '0x',
      formatted: ['', 0, '0', '0x']
    },
    props.transactionIndex
  );
}

function updateTransaction(transaction: TTransaction) {
  emit('updateTransaction', transaction, props.transactionIndex);
}

function setTransactionAsInvalid() {
  const tx: TTransaction = {
    ...props.transaction,
    isValid: false
  };
  emit('updateTransaction', tx, props.transactionIndex);
}
</script>

<template>
  <div class="mt-4 pb-4 first:mt-0">
    <div class="flex items-center justify-between">
      <h3 class="text-left text-base">
        Transaction {{ transactionIndex + 1 }}
      </h3>
      <button
        class="p-[6px] transition-colors duration-200 group"
        @click="emit('removeTransaction', transactionIndex)"
      >
        <BaseIcon
          class="text-red/80 group-hover:text-red"
          name="close"
          size="14"
        />
      </button>
    </div>
    <TransactionType
      :selected-transaction-type="transaction.type"
      @update-transaction-type="updateTransactionType"
    />
    <ContractInteraction
      v-if="transaction.type === 'contractInteraction'"
      :transaction="transaction as ContractInteractionTransaction"
      :network="network"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <TransferFunds
      v-if="transaction.type === 'transferFunds'"
      :network="network"
      :tokens="tokens"
      :transaction="transaction as TransferFundsTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <TransferNFT
      v-if="transaction.type === 'transferNFT'"
      :network="network"
      :safe-address="safeAddress"
      :collectables="collectables"
      :transaction="transaction as TransferNftTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <RawTransaction
      v-if="transaction.type === 'raw'"
      :transaction="transaction as TRawTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <SafeImport
      v-if="transaction.type === 'safeImport'"
      :transaction="transaction as SafeImportTransaction"
      :network="network"
      @update-transaction="updateTransaction"
    />
  </div>
</template>
