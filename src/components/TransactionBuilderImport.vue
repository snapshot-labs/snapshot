<script setup lang="ts">
import { ref, watch } from 'vue';
import { BigNumber } from 'ethers';
import {
  encodeContractData,
  encodeERC20TransferData,
  encodeERC721TransferData
} from '@/helpers/abi';
import {
  ExecutionDataABIs,
  Transaction,
  TransactionOperationType
} from '@/helpers/safe';
import { FunctionFragment } from '@ethersproject/abi';

const props = defineProps<{
  showImportForm: boolean;
  safeAddress: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'importData',
    data: { batches: Transaction[][]; abis: ExecutionDataABIs }
  ): void;
}>();

const rawImportData = ref<string>('');
const isDroppingFile = ref(false);
const batches = ref<Transaction[][]>([]);
const abis = ref<ExecutionDataABIs>({});
const errors = ref<string[]>([]);

async function readFile(file: Blob) {
  const reader = new FileReader();

  reader.addEventListener('load', e => {
    if (e.target?.result) {
      rawImportData.value = e.target.result.toString();
    }
  });

  reader.readAsBinaryString(file);
}

function handleFileDrop(event) {
  readFile(event.dataTransfer.files[0]);
}

function handleFileUpload(event) {
  readFile(event.target.files[0]);
}

function importData() {
  emit('importData', { batches: batches.value, abis: abis.value });
  emit('close');
}

interface ETHTransfer {
  recipient: string;
  amount: string;
}

interface ERC20Transfer {
  recipient: string;
  amount: string;
  tokenAddress: string;
}

interface ERC721Transfer {
  recipient: string;
  tokenId: string;
  tokenAddress: string;
}

interface ContractInteraction {
  contractAddress: string;
  method: string;
  params: any[];
  abi: string;
  operation?: TransactionOperationType;
}

function isETHTransfer(transaction: unknown): transaction is ETHTransfer {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'recipient' in transaction &&
    'amount' in transaction &&
    !('tokenAddress' in transaction)
  );
}

function isERC20Transfer(transaction: unknown): transaction is ERC20Transfer {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'recipient' in transaction &&
    'amount' in transaction &&
    'tokenAddress' in transaction
  );
}

function isERC721Transfer(transaction: unknown): transaction is ERC721Transfer {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'recipient' in transaction &&
    'tokenAddress' in transaction &&
    !('amount' in transaction)
  );
}

function isContractInteraction(
  transaction: unknown
): transaction is ContractInteraction {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'contractAddress' in transaction &&
    'method' in transaction &&
    'params' in transaction
  );
}

function isRawTransaction(transaction: unknown): transaction is Transaction {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'to' in transaction &&
    'value' in transaction &&
    'data' in transaction &&
    'operation' in transaction
  );
}

function mapTransactions(transaction: any) {
  if (isRawTransaction(transaction)) {
    return {
      ...transaction,
      operation: transaction.operation || TransactionOperationType.CALL
    };
  } else if (isETHTransfer(transaction)) {
    return {
      to: transaction.recipient,
      value: BigNumber.from(transaction.amount),
      data: '0x',
      operation: TransactionOperationType.CALL
    };
  } else if (isERC20Transfer(transaction)) {
    return {
      to: transaction.tokenAddress,
      value: BigNumber.from(0),
      data: encodeERC20TransferData(
        transaction.recipient,
        BigNumber.from(transaction.amount)
      ),
      operation: TransactionOperationType.CALL
    };
  } else if (isERC721Transfer(transaction)) {
    return {
      to: transaction.tokenAddress,
      value: BigNumber.from(0),
      data: encodeERC721TransferData(
        props.safeAddress,
        transaction.recipient,
        BigNumber.from(transaction.tokenId)
      ),
      operation: TransactionOperationType.CALL
    };
  } else if (isContractInteraction(transaction)) {
    return {
      to: transaction.contractAddress,
      value: BigNumber.from(0),
      data: encodeContractData(
        transaction.abi,
        FunctionFragment.from(transaction.method),
        transaction.params
      ),
      operation: transaction.operation || TransactionOperationType.CALL
    };
  } else {
    errors.value.push(
      `Invalid transaction data: ${JSON.stringify(transaction, null, 2)}`
    );
    return transaction;
  }
}

function parseRawImportData(): void {
  errors.value = [];
  batches.value = [];
  abis.value = {};

  let parsedImportData: any;

  try {
    parsedImportData = JSON.parse(rawImportData.value);
  } catch {
    errors.value.push('Invalid JSON data');
    return;
  }

  // an object that is not an array will be interpreted as a single transaction
  if (
    typeof parsedImportData === 'object' &&
    !Array.isArray(parsedImportData)
  ) {
    parsedImportData = [[parsedImportData]];
  }

  // an array of objects that are not arrays will be interpreted as a single batch
  if (
    Array.isArray(parsedImportData) &&
    parsedImportData.every(
      batch => typeof batch === 'object' && !Array.isArray(batch)
    )
  ) {
    parsedImportData = [parsedImportData];
  }

  parsedImportData = parsedImportData.map((batch: any) =>
    batch.map(mapTransactions)
  );

  if (errors.value) {
    batches.value = [];
    abis.value = {};
  } else {
    batches.value = parsedImportData;
    abis.value = {}; // TODO: parse ABIs from import data
  }
}

watch(rawImportData, parseRawImportData);
</script>

<template>
  <BaseModal :open="showImportForm" @close="$emit('close')">
    <template #header>
      <h3>Import transactions</h3>
    </template>

    <BaseContainer class="py-4">
      <textarea
        v-model="rawImportData"
        placeholder="Paste in JSON or drop a file here."
        class="h-[220px] w-full resize-none rounded-3xl border border-emerald-500 p-3 outline-none"
        :class="{
          'bg-gray-100': isDroppingFile
        }"
        @dragenter.prevent="isDroppingFile = true"
        @dragleave.prevent="isDroppingFile = false"
        @drop.prevent="
          isDroppingFile = false;
          handleFileDrop($event);
        "
        @dragover.prevent
      />
      <div
        v-if="rawImportData && errors.length > 0"
        class="-mt-5 rounded-b-3xl bg-red px-3 pb-2 pt-5 text-white"
      >
        <div v-for="(error, index) in errors" :key="index">
          {{ error }}
        </div>
      </div>
      <div class="mt-3 flex space-x-2">
        <label
          class="flex grow cursor-pointer items-center justify-center rounded-3xl border px-4 py-2 text-skin-link hover:border-skin-text"
        >
          Upload JSON file
          <input
            accept="application/json, text/plain"
            class="hidden"
            type="file"
            @change="handleFileUpload($event)"
          />
        </label>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/gnosis/safe-tasks/blob/c9c52f76d16d43b0682950f3411ef283871acb5f/tx_input.sample.json"
        >
          <BaseButton>
            Examples
            <i-ho-external-link class="mb-1 inline text-xs text-gray-400" />
          </BaseButton>
        </a>
      </div>
    </BaseContainer>

    <template #footer>
      <BaseButton
        class="w-full"
        primary
        :disabled="errors.length > 0"
        @click="importData"
      >
        Import
      </BaseButton>
    </template>
  </BaseModal>
</template>
