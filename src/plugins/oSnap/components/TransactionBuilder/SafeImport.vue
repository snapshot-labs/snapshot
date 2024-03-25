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
import FileInput from '../Input/FileInput/FileInput.vue';

const props = defineProps<{
  transaction: SafeImportTransaction | undefined;
  network: Network;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

const file = ref<File>();
const safeFile = ref<GnosisSafe.BatchFile>(); // raw, type-safe file
const selectedTransactionIndex = ref<number>();
const processedTransactions = ref<CreateSafeTransactionParams[]>();
const isValueValid = ref(true);
const isFileInvalid = computed(() => {
  return file.value && !safeFile.value;
});
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
    })
    .catch(e => {
      safeFile.value = undefined;
      console.error(e);
    });
});

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

function handleFileChange(_file: File | null) {
  if (_file) {
    resetState();
    file.value = _file;
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
  <FileInput
    :error="
      isFileInvalid ? 'Safe file corrupted. Please select another.' : undefined
    "
    @update:file="handleFileChange"
    :file-type="'application/json'"
  />

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
