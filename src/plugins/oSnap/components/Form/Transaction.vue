<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { transactionTypes } from '../..';
import {
  ContractInteractionTransaction,
  TransferNftTransaction,
  type NFT,
  type Network,
  type RawTransaction as TRawTransaction,
  type Transaction as TTransaction,
  type Token,
  type TransactionType,
  type TransferFundsTransaction
} from '../../types';
import ContractInteraction from './ContractInteraction.vue';
import RawTransaction from './RawTransaction.vue';
import TransferFunds from './TransferFunds.vue';
import TransferNFT from './TransferNFT.vue';

const props = defineProps<{
  isReadOnly: boolean;
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

const newTransaction = ref<TTransaction>(cloneDeep(props.transaction));

function updateTransactionType(transactionType: string) {
  if (!transactionTypes.includes(transactionType as TransactionType)) {
    console.warn('Invalid transaction type');
    return;
  }
  newTransaction.value.type = transactionType as TransactionType;
  emit('updateTransaction', newTransaction.value, props.transactionIndex);
}

function updateTransaction(transaction: TTransaction) {
  newTransaction.value = transaction;
  emit('updateTransaction', newTransaction.value, props.transactionIndex);
}
</script>

<template>
  <div v-if="isReadOnly">
    <p>{{ transaction.type }} transaction</p>
  </div>
  <UiSelect
    v-else
    :disabled="isReadOnly"
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
    :is-read-only="isReadOnly"
    :transaction="(newTransaction as ContractInteractionTransaction)"
    :network="network"
  />

  <TransferFunds
    v-if="transaction.type === 'transferFunds'"
    :is-read-only="isReadOnly"
    :network="network"
    :tokens="tokens"
    :transaction="(newTransaction as TransferFundsTransaction)"
    @update-transaction="updateTransaction"
  />

  <TransferNFT
    v-if="transaction.type === 'transferNFT'"
    :is-read-only="isReadOnly"
    :network="network"
    :safe-address="safeAddress"
    :collectables="collectables"
    :transaction="(newTransaction as TransferNftTransaction)"
    @update-transaction="updateTransaction"
  />

  <RawTransaction
    v-if="transaction.type === 'raw'"
    :is-read-only="isReadOnly"
    :transaction="(newTransaction as TRawTransaction)"
    @update-transaction="updateTransaction"
  />
</template>
