<script setup lang="ts">
import { SafeImportTransaction, GnosisSafe, Network } from '../../types';
import {
  createSafeImportTransaction,
  CreateSafeTransactionParams,
  extractSafeMethodAndParams,
  parseValueInput
} from '../../utils';
import { parseGnosisSafeFile } from '../../utils/safeImport';
import MethodParameterInput from '../../components/Input/MethodParameter.vue';
import AddressInput from '../../components/Input/Address.vue';
import { isAddress } from '@ethersproject/address';

const props = defineProps<{
  transaction: SafeImportTransaction | undefined;
  network: Network;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

type FileInputState =
  | 'IDLE'
  | 'DROPPING'
  | 'INVALID_TYPE'
  | 'PARSING_ERROR'
  | 'VALID';
const fileInputState = ref<FileInputState>('IDLE');
function updateFileInputState(state: FileInputState) {
  fileInputState.value = state;
}
function toggleDropping() {
  if (fileInputState.value === 'DROPPING') {
    updateFileInputState('IDLE');
    return;
  }
  updateFileInputState('DROPPING');
}
const isDropping = computed(() => fileInputState.value === 'DROPPING');

const file = ref<File>();
const safeFile = ref<GnosisSafe.BatchFile>(); // raw, type-safe file
const selectedTransactionIndex = ref<number>();
const processedTransactions = ref<CreateSafeTransactionParams[]>();
const isValueValid = ref(true);
const finalTransaction = ref<CreateSafeTransactionParams>(); // decoded method, extracted args

function resetState() {
  file.value = undefined;
  safeFile.value = undefined;
  selectedTransactionIndex.value = undefined;
  processedTransactions.value = undefined;
  finalTransaction.value = undefined;
}

const isToValid = computed(() => {
  if (!finalTransaction?.value?.to) {
    return true;
  }
  return isAddress(finalTransaction.value.to);
});

function updateFinalTransaction(tx: Partial<CreateSafeTransactionParams>) {
  finalTransaction.value = {
    ...finalTransaction.value,
    ...tx
  } as CreateSafeTransactionParams;
}

function updateParams(
  paramsToUpdate: CreateSafeTransactionParams['parameters']
) {
  finalTransaction.value = {
    ...finalTransaction.value,
    parameters: {
      ...finalTransaction.value?.parameters,
      ...paramsToUpdate
    }
  } as CreateSafeTransactionParams;
}

function updateValue(newValue: string) {
  try {
    if (!finalTransaction.value) {
      return;
    }
    const parsed = parseValueInput(newValue);
    updateFinalTransaction({
      value: parsed
    });
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  } finally {
    updateTransaction();
  }
}

watch(file, async () => {
  if (!file.value) return;
  parseGnosisSafeFile(file.value)
    .then(result => {
      safeFile.value = result;
      updateFileInputState('VALID');
    })
    .catch(e => {
      updateFileInputState('PARSING_ERROR');

      console.error(e);
    });
});

function handleDrop(event: DragEvent) {
  resetState();
  const _file = event.dataTransfer?.files?.[0];
  if (!_file) return;
  if (_file.type !== 'application/json') {
    updateFileInputState('INVALID_TYPE');
    return;
  }
  file.value = _file;
}

function handleFileChange(event: Event) {
  resetState();
  const _file = (event?.currentTarget as HTMLInputElement)?.files?.[0];
  if (!_file) return;
  if (_file.type !== 'application/json') {
    updateFileInputState('INVALID_TYPE');
    return;
  }
  file.value = _file;
}

function updateTransaction() {
  try {
    if (!finalTransaction.value) {
      throw new Error('No Transaction selected');
    }

    if (!isValueValid.value) {
      throw new Error('"Value" field is invalid');
    }

    if (!isToValid.value) {
      throw new Error('"To" field is invalid');
    }

    const tx = createSafeImportTransaction(finalTransaction.value);
    console.log(tx);
    emit('updateTransaction', tx);
  } catch (error) {
    console.error(error);
    props.setTransactionAsInvalid();
  }
}

watch(safeFile, safeFile => {
  if (safeFile) {
    finalTransaction.value = undefined;
    selectedTransactionIndex.value = undefined;
    const convertedTxs = safeFile.transactions.map(extractSafeMethodAndParams);
    processedTransactions.value = convertedTxs;
  }
});

watch(selectedTransactionIndex, index => {
  if (
    index === undefined ||
    !processedTransactions.value ||
    processedTransactions.value[index] === undefined
  )
    return;
  finalTransaction.value = processedTransactions.value[index];
});

watch(finalTransaction, updateTransaction);
</script>

<template>
  <label
    for="file_input"
    @dragenter.prevent="toggleDropping"
    @dragleave.prevent="toggleDropping"
    @dragover.prevent
    @drop.prevent="handleDrop($event)"
    class="my-2 w-full group hover:bg-transparent hover:border-skin-text border-skin-border hover:cursor-pointer inline-block border border-dashed py-2 px-4 rounded-xl"
    :class="{
      'border-solid border-skin-text bg-transparent': isDropping,
      'bg-red/10 border-red/50 text-red/80':
        fileInputState === 'INVALID_TYPE' || fileInputState === 'PARSING_ERROR',
      'bg-green/10 border-green/50 text-green/80': fileInputState === 'VALID'
    }"
  >
    <div class="flex flex-col gap-1 items-center justify-center">
      <i-ho-upload />
      <span v-if="fileInputState === 'IDLE' || fileInputState === 'DROPPING'"
        >Click to select file, or drag n drop</span
      >
      <span v-if="fileInputState === 'INVALID_TYPE'"
        >File type must be JSON. Please choose another.</span
      >
      <span v-if="fileInputState === 'PARSING_ERROR'"
        >Safe file corrupted, please choose another.</span
      >
      <span v-if="fileInputState === 'VALID' && file?.name">{{
        file.name
      }}</span>
    </div>

    <input
      id="file_input"
      class="hidden"
      accept="application/json"
      type="file"
      @change="handleFileChange"
    />
  </label>

  <UiSelect
    v-if="safeFile?.transactions?.length"
    v-model="selectedTransactionIndex"
  >
    <template #label>Select Transaction</template>
    <option v-for="(tx, i) in safeFile.transactions" :key="i" :value="i">
      {{
        tx?.contractMethod?.name
          ? `Contract interaction (${tx?.contractMethod?.name})`
          : 'Native Transfer'
      }}
    </option>
  </UiSelect>

  <div v-if="finalTransaction" class="flex flex-col gap-2 mt-2">
    <AddressInput
      :modelValue="finalTransaction.to"
      @change="(e: string) => updateFinalTransaction({ to: e })"
      :label="$t('safeSnap.to')"
      :error="!isToValid ? 'Invalid address' : undefined"
    />

    <UiInput
      placeholder="123456"
      :error="!isValueValid && 'Invalid value'"
      :model-value="finalTransaction.value"
      @update:model-value="(e: string) => updateValue(e)"
    >
      <template #label>Value (wei)</template>
    </UiInput>

    <!-- ContractInteraction Parameters -->
    <div
      class="flex flex-col gap-2"
      v-if="finalTransaction.functionFragment?.inputs?.length"
    >
      <div class="text-left mt-3">Function Parameters</div>
      <div class="divider h-[1px] bg-skin-border mb-3" />
      <MethodParameterInput
        v-for="input in finalTransaction.functionFragment.inputs"
        :key="input.name"
        :validateOnMount="true"
        :parameter="input"
        :value="finalTransaction?.parameters?.[input.name] ?? ''"
        @update-parameter-value="
          (e: string) => updateParams({ [input.name]: e })
        "
      />
    </div>
  </div>
</template>
