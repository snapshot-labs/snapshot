<script setup lang="ts">
import { parseValue } from '@/helpers/utils';
import { FunctionFragment } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import {
  InterfaceDecoder,
  contractInteractionToModuleTransaction,
  getABIWriteFunctions,
  getContractABI,
  getContractTransactionData,
  validateTransaction
} from '../../index';
import InputAddress from '../Input/Address.vue';
import InputMethodParameter from '../Input/MethodParameter.vue';

const props = defineProps<{
  modelValue: {
    to: string;
    abi: string;
    value: string;
    data: string;
  };
  nonce: string;
  preview: boolean;
  network: string;
}>();

const emit = defineEmits(['update:modelValue']);

const to = ref('');
const abi = ref('');
const validAbi = ref(true);
const value = ref('0');
const validValue = ref(true);
const nonce = ref('0');
const methods = ref<FunctionFragment[]>([]);
const selectedMethodIndex = ref(0);
const selectedMethod = computed(() => methods.value[selectedMethodIndex.value]);
const parameters = ref<string[]>([]);
const selectedParameters = ref<string[]>([]);

function updateTransaction() {
  if (
    props.preview ||
    !isBigNumberish(value.value) ||
    !isAddress(to.value) ||
    !abi.value ||
    !selectedMethod.value
  )
    return;
  try {
    if (isBigNumberish(value.value) && isAddress(to.value)) {
      const data = getContractTransactionData(
        abi.value,
        selectedMethod.value,
        parameters.value
      );

      const transaction = contractInteractionToModuleTransaction({
        data,
        to: to.value,
        value: value.value,
        nonce: nonce.value,
        method: selectedMethod.value
      });

      if (validateTransaction(transaction)) {
        emit('update:modelValue', transaction);
        return;
      }
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
}

function updateParameter(index: number, value: string) {
  parameters.value[index] = value;
  updateTransaction();
}

function updateMethod(index: number) {
  selectedParameters.value = [];
  selectedMethodIndex.value = index;
  updateTransaction();
}

function updateAbi(newAbi: string) {
  abi.value = newAbi;
  methods.value = [];

  try {
    methods.value = getABIWriteFunctions(abi.value);
    validAbi.value = true;
    updateMethod(0);
  } catch (error) {
    validAbi.value = false;
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
    validValue.value = true;
  } catch (error) {
    validValue.value = false;
  }
  updateTransaction();
}

onMounted(async () => {
  if (props.modelValue === undefined) return;

  to.value = props.modelValue.to ?? '';

  if (props.preview) {
    setTimeout(() => updateTransaction(), 1000);
    return;
  }

  const transactionDecoder = new InterfaceDecoder(abi.value);
  selectedMethod.value = transactionDecoder.getMethodFragment(
    props.modelValue.data
  );
  parameters.value = transactionDecoder.decodeFunction(
    props.modelValue.data,
    selectedMethod.value
  );

  methods.value = [selectedMethod.value];
  updateValue(props.modelValue.value);
  updateAbi(typeof abi === 'object' ? JSON.stringify(abi) : abi);
  updateTransaction();
});
</script>

<template>
  <div class="space-y-2">
    <InputAddress
      v-model="to"
      :disabled="preview"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
      @validAddress="handleAddressChanged()"
    />

    <UiInput
      :disabled="config.preview"
      :error="!validValue && $t('safeSnap.invalidValue')"
      :model-value="value"
      @update:modelValue="handleValueChange($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      :disabled="config.preview"
      :error="!validAbi && $t('safeSnap.invalidAbi')"
      :model-value="abi"
      @update:modelValue="handleABIChanged($event)"
    >
      <template #label>ABI</template>
    </UiInput>

    <div v-if="methods.length">
      <UiSelect
        v-model="methodIndex"
        :disabled="config.preview"
        @change="handleMethodChanged()"
      >
        <template #label>function</template>
        <option v-for="(method, i) in methods" :key="i" :value="i">
          {{ method.name }}()
        </option>
      </UiSelect>

      <div v-if="selectedMethod && selectedMethod.inputs.length">
        <div class="divider"></div>

        <InputMethodParameter
          v-for="(input, index) in selectedMethod.inputs"
          :key="input.name"
          :disabled="config.preview"
          :model-value="parameters[index]"
          :parameter="input"
          @update:modelValue="handleParameterChanged(index, $event)"
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
