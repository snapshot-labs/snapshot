<script setup lang="ts">
import { parseAmount } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isHexString } from '@ethersproject/bytes';
import { SafeImportTransaction, GnosisSafe } from '../../types';
import {
  createSafeImportTransaction,
  parseValueInput,
  isSafeFile,
  getABIWriteFunctions,
  CreateSafeTransactionParams,
  extractSafeMethodAndParams
} from '../../utils';
import AddressInput from '../Input/Address.vue';
import { parseGnosisSafeFile } from '../../utils/safeImport';
import { FunctionFragment } from '@ethersproject/abi';
import MethodParameterInput from '../../components/Input/MethodParameter.vue';

type PartialSafeImportTransaction = Omit<SafeImportTransaction, 'formatted'>;

const props = defineProps<{
  transaction: SafeImportTransaction | undefined;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

const file = ref<File>();
const safeFile = ref<GnosisSafe.BatchFile>(); // raw, type-safe file
const selectedTransactionIndex = ref<number>();
const processedTransactions = ref<CreateSafeTransactionParams[]>();

const finalTransaction = ref<CreateSafeTransactionParams>(); // decoded method, extracted args

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

function handleFileChange(event: Event) {
  const _file = (event?.currentTarget as HTMLInputElement)?.files?.[0];
  if (!_file) return;
  file.value = _file;
  return (
    parseGnosisSafeFile(file.value)
      .then(result => {
        safeFile.value = result;
        // TODO: remove log
        console.log(safeFile.value);
      })
      // TODO: show error
      .catch(console.error)
  );
}

function updateTransaction() {
  try {
    debugger;
    if (!finalTransaction.value) {
      throw new Error('No Transaction selected');
    }
    //  TODO: validate
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
    //reset
    finalTransaction.value = undefined;
    const convertedTxs = safeFile.transactions.map(extractSafeMethodAndParams);
    processedTransactions.value = convertedTxs;
  }
});

// need a way to select which transaction we want to import
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
  <div class="space-y-2">
    <input
      accept="application/json"
      type="file"
      @change="handleFileChange($event)"
    />
    <div v-if="file">Selected file: {{ file.name }}</div>
  </div>
  <div
    v-if="safeFile?.transactions?.length"
    class="flex w-full flex-col gap-4 rounded-2xl border border-skin-border p-3 md:p-4 relative"
  >
    <UiSelect v-model="selectedTransactionIndex">
      <template #label>Select Transaction</template>
      <option v-for="(tx, i) in safeFile.transactions" :key="i" :value="i">
        {{ i + 1 }}. {{ tx?.contractMethod?.name }}
      </option>
    </UiSelect>
  </div>

  <div
    class="flex flex-col gap-2"
    v-if="finalTransaction && finalTransaction.functionFragment?.inputs?.length"
  >
    <MethodParameterInput
      v-for="input in finalTransaction.functionFragment.inputs"
      :key="input.name"
      :validateOnMount="true"
      :parameter="input"
      :value="finalTransaction?.parameters?.[input.name] ?? ''"
      @update-parameter-value="(e: string) => updateParams({ [input.name]: e })"
    />
  </div>

  <div v-if="props.transaction">
    <strong>{{ props.transaction.subtype }}</strong>
    <!-- ContractInteraction -->
    <div v-if="props.transaction.methodName">
      {{ props.transaction.methodName }}
    </div>
    <div v-if="props.transaction.parameters">
      <p
        v-for="[paramName, paramValue] in Object.entries(
          props.transaction.parameters
        )"
      ></p>
    </div>
    <pre lang="json">
        {{ JSON.stringify(props.transaction.parameters) }}</pre
    >

    <!-- Native Transfer -->
  </div>

  <!-- <div
    v-if="props?.transaction?.parameters?.length"
    class="flex w-full flex-col gap-4 rounded-2xl border border-skin-border p-3 md:p-4 relative"
  >
    <ReadOnly v-for="param in props.transaction.parameters">
      <strong
        class="mr-2 inline-block whitespace-nowrap first-letter:capitalize"
        >{{ param.name }} ({{ param.type }})</strong
      >
      <span class="break-all">{{ param.value }}</span>
    </ReadOnly>
  </div> -->
</template>
