<script setup lang="ts">
import { parseAmount } from '@/helpers/utils';
import { FunctionFragment } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';

import { ContractInteractionTransaction, Network } from '../../types';
import {
  createContractInteractionTransaction,
  getABIWriteFunctions,
  getContractABI,
  processContractInteractionTransaction,
  validateTransaction
} from '../../utils';
import AddressInput from '../Input/Address.vue';
import MethodParameterInput from '../Input/MethodParameter.vue';

const props = defineProps<{
  network: Network;
  transaction: ContractInteractionTransaction;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: ContractInteractionTransaction];
}>();

const to = ref(props.transaction.to ?? '');
const isToValid = computed(() => {
  return to.value === '' || isAddress(to.value);
});
const abi = ref(props.transaction.abi ?? '');
const isAbiValid = ref(true);
const value = ref(props.transaction.value ?? '0');
const isValueValid = ref(true);
const methods = ref<FunctionFragment[]>([]);
const selectedMethodName = ref(props.transaction.methodName ?? '');
const selectedMethod = computed(
  () =>
    methods.value.find(method => method.name === selectedMethodName.value) ??
    methods.value[0]
);
const parameters = ref<string[]>([]);

function updateTransaction() {
  // if (!isValueValid || !isToValid || !isAbiValid) return;

  const transaction = processContractInteractionTransaction({
    to: to.value,
    value: value.value,
    abi: abi.value,
    method: selectedMethod.value,
    parameters: parameters.value
  });

  emit('updateTransaction', transaction);
}

function updateParameter(index: number, value: string) {
  parameters.value[index] = value;
  updateTransaction();
}

function updateMethod(methodName: string) {
  parameters.value = [];
  selectedMethodName.value = methodName;
  updateTransaction();
}

function updateAbi(newAbi: string) {
  abi.value = newAbi;
  methods.value = [];
  try {
    methods.value = getABIWriteFunctions(abi.value);
    isAbiValid.value = true;
    updateMethod(methods.value[0].name);
  } catch (error) {
    isAbiValid.value = false;
    console.warn('error extracting useful methods', error);
  }
  updateTransaction();
}

async function updateAddress() {
  const result = await getContractABI(props.network, to.value);
  if (result && result !== abi.value) {
    updateAbi(result);
  }
  updateTransaction();
}

function updateValue(newValue: string) {
  value.value = newValue;
  try {
    parseAmount(newValue);
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  }
  updateTransaction();
}
</script>

<template>
  <div class="space-y-2">
    <AddressInput
      v-model="to"
      :label="$t('safeSnap.to')"
      @update:model-value="updateAddress()"
    />

    <UiInput
      :error="!isValueValid && $t('safeSnap.invalidValue')"
      :model-value="value"
      @update:model-value="updateValue($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      :error="!isAbiValid && $t('safeSnap.invalidAbi')"
      :model-value="abi"
      @update:model-value="updateAbi($event)"
    >
      <template #label>ABI</template>
    </UiInput>

    <div v-if="methods.length">
      <UiSelect v-model="selectedMethodName" @change="updateMethod($event)">
        <template #label>function</template>
        <option v-for="(method, i) in methods" :key="i" :value="method.name">
          {{ method.name }}()
        </option>
      </UiSelect>

      <div
        v-if="selectedMethod && selectedMethod.inputs.length"
        class="flex flex-col gap-2"
      >
        <div class="divider h-[1px] bg-skin-border my-3" />

        <MethodParameterInput
          v-for="(input, index) in selectedMethod.inputs"
          :key="input.name"
          :parameter="input"
          :value="parameters[index]"
          @update-parameter-value="updateParameter(index, $event)"
        />
      </div>
    </div>
  </div>
</template>
