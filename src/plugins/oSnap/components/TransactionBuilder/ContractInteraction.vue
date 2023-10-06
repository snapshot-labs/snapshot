<script setup lang="ts">
import { parseValue } from '@/helpers/utils';
import { FunctionFragment } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';

import { ContractInteractionTransaction, Network } from '../../types';
import {
  createContractInteractionTransaction,
  getABIWriteFunctions,
  getContractABI,
  validateTransaction
} from '../../utils';
import InputAddress from '../Input/Address.vue';
import InputMethodParameter from '../Input/MethodParameter.vue';

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
const selectedParameters = ref<string[]>([]);

function updateTransaction() {
  if (!isValueValid || !isToValid || !isAbiValid) return;
  try {
    const transaction = createContractInteractionTransaction({
      to: to.value,
      value: value.value,
      abi: abi.value,
      method: selectedMethod.value,
      parameters: selectedParameters.value
    });

    if (validateTransaction(transaction)) {
      emit('updateTransaction', transaction);
      return;
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
}

function updateParameter(index: number, value: string) {
  parameters.value[index] = value;
  updateTransaction();
}

function updateMethod(methodName: string) {
  selectedParameters.value = [];
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
    parseValue(newValue);
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  }
  updateTransaction();
}
</script>

<template>
  <div class="space-y-2">
    <InputAddress
      v-model="to"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
      @validAddress="updateAddress()"
    />

    <UiInput
      :error="!isValueValid && $t('safeSnap.invalidValue')"
      :model-value="value"
      @update:modelValue="updateValue($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      :error="!isAbiValid && $t('safeSnap.invalidAbi')"
      :model-value="abi"
      @update:modelValue="updateAbi($event)"
    >
      <template #label>ABI</template>
    </UiInput>

    <div v-if="methods.length">
      <UiSelect
        v-model="selectedMethodName"
        @change="updateMethod($event)"
      >
        <template #label>function</template>
        <option v-for="(method, i) in methods" :key="i" :value="method.name">
          {{ method.name }}()
        </option>
      </UiSelect>

      <div v-if="selectedMethod && selectedMethod.inputs.length">
        <div class="divider"></div>

        <InputMethodParameter
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

<style lang="scss" scoped>
.textarea {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  padding: 0 24px;
  outline: none;
  font-size: 14px;

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }
}

.divider {
  border-top: 1px solid #cacaca;
  margin-top: 16px;
  margin-bottom: 24px;
}
</style>
../../types/types
