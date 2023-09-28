<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { transactionTypes } from '../..';
import type {
  Network,
  NFT,
  Token,
  TransactionType,
  Transaction as TTransaction
} from '../../types';
import RawTransaction from './RawTransaction.vue';
import TransferFunds from './TransferFunds.vue';
import TransferNFT from './TransferNFT.vue';
import ContractInteraction from './ContractInteraction.vue';

const props = defineProps<{
  isProposal: boolean;
  transaction: TTransaction;
  transactionIndex: number;
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
}>();

const emit = defineEmits<{
  updateTransaction: [
    transaction: TTransaction,
    transactionIndex: number
  ];
  removeTransaction: [transactionIndex: number];
}>();

const newTransaction = ref<TTransaction>(cloneDeep(props.transaction));

function updateTransactionType(transactionType: string) {
  if (!transactionTypes.includes(transactionType as TransactionType)) {
    console.warn('Invalid transaction type');
    return;
  }
  newTransaction.value.type = transactionType as TransactionType;
  emit(
    'updateTransaction',
    newTransaction.value,
    props.transactionIndex
  );
}

function updateTransaction(transaction: TTransaction) {
  newTransaction.value = transaction;
  emit(
    'updateTransaction',
    newTransaction.value,
    props.transactionIndex
  );
}
</script>

<template>
  <UiSelect
    :disabled="isProposal"
    :model-value="transaction.type"
    @update:modelValue="updateTransactionType"
  >
    <template #label>{{ $t('safeSnap.type') }}</template>
    <option value="transferFunds">{{ $t('safeSnap.transferFunds') }}</option>
    <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
    <option value="contractInteraction">
      {{ $t('safeSnap.contractInteraction') }}
    </option>
    <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
  </UiSelect>

  <ContractInteraction
    v-if="transaction.type === 'contractInteraction'"
  />

  <TransferFunds
    v-if="transaction.type === 'transferFunds'"
    :is-proposal="isProposal"
    :network="network"
    :tokens="tokens"
    :transaction="newTransaction"
    @update-transaction="updateTransaction"
  />

  <TransferNFT
    v-if="transaction.type === 'transferNFT'"
    :is-proposal="isProposal"
    :network="network"
    :safe-address="safeAddress"
    :collectables="collectables"
    :transaction="newTransaction"
    @update-transaction="updateTransaction"
  />

  <RawTransaction
    v-if="transaction.type === 'raw'"
    :is-proposal="isProposal"
    :transaction="newTransaction"
    @update-transaction="updateTransaction"
  />
</template>
