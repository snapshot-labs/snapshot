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
const isDropping = ref(false);
function toggleIsDropping() {
  isDropping.value = !isDropping.value;
}
const file = ref<File>();
const safeFile = ref<GnosisSafe.BatchFile>(); // raw, type-safe file
const selectedTransactionIndex = ref<number>();
const processedTransactions = ref<CreateSafeTransactionParams[]>();
const isValueValid = ref(true);
const finalTransaction = ref<CreateSafeTransactionParams>(); // decoded method, extracted args

const isToValid = computed(() => {
  if (!finalTransaction?.value?.to) {
    return true;
  }
  return isAddress(finalTransaction.value.to);
});

function updateFinalTransaction(tx: Partial<CreateSafeTransactionParams>) {
  finalTransaction.value = {
    ...finalTransaction.value,
    tx
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
  if (file.value) {
    parseGnosisSafeFile(file.value)
      .then(result => {
        safeFile.value = result;
      })
      // TODO: show error
      .catch(console.error);
  }
});

function handleDrop(event: DragEvent) {
  const _file = event.dataTransfer?.files?.[0];
  if (!_file) return;
  file.value = _file;
}

function handleFileChange(event: Event) {
  const _file = (event?.currentTarget as HTMLInputElement)?.files?.[0];
  if (!_file) return;
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
    @dragenter.prevent="toggleIsDropping"
    @dragleave.prevent="toggleIsDropping"
    @dragover.prevent
    @drop.prevent="handleDrop($event)"
    class="my-3 group hover:cursor-pointer hover:bg-green/10 hover:border-solid hover:border-green/50 inline-block border border-dashed border-space-border p-1 w-full rounded-full"
    :class="{
      'bg-green/10 border-solid border-green/50': isDropping
    }"
  >
    {{ file?.name ?? 'Click to select file, or drag n drop' }}

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
      @update:model-value="(e: string) => updateFinalTransaction({ value: e })"
    >
      <template #label>Value (wei)</template>
    </UiInput>

    <!-- ContractInteraction With Args -->
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
