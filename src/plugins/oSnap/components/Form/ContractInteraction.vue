<script setup lang="ts">
import { parseValue } from '@/helpers/utils';
import { FunctionFragment } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import {
  createContractInteractionTransaction,
  getABIWriteFunctions,
  getContractABI,
  validateTransaction
} from '../../index';
import {
  ContractInteractionTransaction,
  Network,
  Transaction
} from '../../types';
import InputAddress from '../Input/Address.vue';
import InputMethodParameter from '../Input/MethodParameter.vue';

const props = defineProps<{
  network: Network;
  isReadOnly: boolean;
  transaction: Transaction;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: ContractInteractionTransaction];
}>();

const to = ref('');
const isToValid = computed(() => {
  return to.value === '' || isAddress(to.value);
});
const abi = ref('');
const isAbiValid = ref(true);
const value = ref('0');
const isValueValid = ref(true);
const methods = ref<FunctionFragment[]>([]);
const selectedMethodIndex = ref(0);
const selectedMethod = computed(() => methods.value[selectedMethodIndex.value]);
const parameters = ref<string[]>([]);
const selectedParameters = ref<string[]>([]);

function updateTransaction() {
  if (
    props.isReadOnly ||
    !isBigNumberish(value.value) ||
    !isAddress(to.value) ||
    !abi.value ||
    !selectedMethod.value
  )
    return;
  try {
    if (isBigNumberish(value.value) && isAddress(to.value)) {
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
    isAbiValid.value = true;
    updateMethod(0);
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
      :disabled="isReadOnly"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
      @validAddress="updateAddress()"
    />

    <UiInput
      :disabled="isReadOnly"
      :error="!isValueValid && $t('safeSnap.invalidValue')"
      :model-value="value"
      @update:modelValue="updateValue($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      :disabled="isReadOnly"
      :error="!isAbiValid && $t('safeSnap.invalidAbi')"
      :model-value="abi"
      @update:modelValue="updateAbi($event)"
    >
      <template #label>ABI</template>
    </UiInput>

    <div v-if="methods.length">
      <UiSelect
        v-model="selectedMethodIndex"
        :disabled="isReadOnly"
        @change="updateMethod($event)"
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
