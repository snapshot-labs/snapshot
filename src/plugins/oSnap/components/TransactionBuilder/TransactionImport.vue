<script setup lang="ts">
import {
  GnosisSafe,
  Network,
  SafeImportTransaction,
  isErrorWithMessage
} from '../../types';
import { initializeSafeImportTransaction } from '../../utils';
import { parseGnosisSafeFile } from '../../utils/safeImport';
import FileInput from '../Input/FileInput/FileInput.vue';

const props = defineProps<{
  network: Network;
  safe: GnosisSafe | null;
}>();

// Emits definition
const emit = defineEmits<{
  (
    event: 'update:importedTransactions',
    importedTransactions: SafeImportTransaction[]
  ): void;
}>();

const file = ref<File>(); // raw file, if valid type
const safeFile = ref<GnosisSafe.BatchFile>(); // parsed, type-safe file

const error = ref<string>();

function resetState() {
  file.value = undefined;
  safeFile.value = undefined;
  error.value = undefined;
}

watch(file, async () => {
  if (!file.value) return;
  parseGnosisSafeFile(file.value, props.safe)
    .then(result => {
      safeFile.value = result;
    })
    .catch(e => {
      safeFile.value = undefined;
      if (isErrorWithMessage(e)) {
        error.value = e.message;
        return;
      }
      error.value = 'Safe file corrupted. Please select another.';
    });
});

function handleFileChange(_file: File | null) {
  if (_file) {
    resetState();
    file.value = _file;
  }
}

watch(safeFile, safeFile => {
  if (safeFile) {
    const convertedTxs = safeFile.transactions.map(
      initializeSafeImportTransaction
    );
    emit('update:importedTransactions', convertedTxs);
  }
});
</script>

<template>
  <FileInput
    :error="error"
    @update:file="handleFileChange"
    :file-type="'application/json'"
    :defaultLabel="'Import transactions from Safe file, drag and drop'"
  />
</template>
