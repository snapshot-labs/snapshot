<script setup lang="ts">
import { GnosisSafe, Network, SafeImportTransaction } from '../../types';
import { initializeSafeImportTransaction } from '../../utils';
import { parseGnosisSafeFile } from '../../utils/safeImport';
import FileInput from '../Input/FileInput/FileInput.vue';

const props = defineProps<{
  network: Network;
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

const isFileInvalid = computed(() => {
  return file.value && !safeFile.value;
});

function resetState() {
  file.value = undefined;
  safeFile.value = undefined;
}

// TODO: check network and "createdFromSafeAddress"
// TODO: allow multiple files at once

watch(file, async () => {
  if (!file.value) return;
  parseGnosisSafeFile(file.value)
    .then(result => {
      safeFile.value = result;
    })
    .catch(e => {
      safeFile.value = undefined;
      console.error(e);
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
  <div class="text-skin-link mt-2">Import from Safe, or use the builder</div>
  <FileInput
    :error="
      isFileInvalid ? 'Safe file corrupted. Please select another.' : undefined
    "
    @update:file="handleFileChange"
    :file-type="'application/json'"
  />
</template>
