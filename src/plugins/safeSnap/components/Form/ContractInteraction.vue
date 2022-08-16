<script setup lang="ts">
import Plugin from '../../index';
import {
  getContractABI,
  getABIWriteFunctions,
  getContractTransactionData
} from '@/plugins/safeSnap/utils/abi';
import { contractInteractionToModuleTransaction } from '@/plugins/safeSnap/utils/transactions';
import { InterfaceDecoder } from '@/plugins/safeSnap/utils/decoder';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { parseAmount } from '@/helpers/utils';
import SafeSnapInputAddress from '../Input/Address.vue';
import SafeSnapInputMethodParameter from '../Input/MethodParameter.vue';
import { ref, onMounted, watch } from 'vue';
import { Fragment, JsonFragment, FunctionFragment } from '@ethersproject/abi';

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue']);

const plugin = new Plugin();

const to = ref('');
const abi = ref('');
const value = ref('0');
const selectedMethod = ref<any>(undefined);
const methods = ref<(Fragment | JsonFragment | FunctionFragment)[]>([]);
const parameters = ref<string[]>([]);

const validAbi = ref(true);
const validValue = ref(true);
const methodIndex = ref(0);

if (props.modelValue) {
  try {
    to.value = props.modelValue.to || '';
    abi.value =
      typeof props.modelValue.abi === 'object'
        ? JSON.stringify(props.modelValue.abi)
        : props.modelValue.abi;
    value.value = props.modelValue.value || '0';

    const transactionDecoder = new InterfaceDecoder(props.modelValue.abi);
    selectedMethod.value = transactionDecoder.getMethodFragment(
      props.modelValue.data
    );
    parameters.value = transactionDecoder.decodeFunction(
      props.modelValue.data,
      selectedMethod.value
    );
    methods.value = [selectedMethod.value];
  } catch (err) {
    console.error('error decoding contract interaction tx', err);
  }
}

const updateTransaction = () => {
  if (props.config.preview) return;
  try {
    if (
      isBigNumberish(value.value) &&
      isAddress(to.value) &&
      selectedMethod.value
    ) {
      const data = getContractTransactionData(
        abi.value,
        selectedMethod.value,
        parameters.value
      );

      const transaction = contractInteractionToModuleTransaction(
        {
          data,
          to: to.value,
          value: value.value,
          nonce: props.nonce,
          method: selectedMethod.value
        },
        props.config.multiSendAddress
      );

      if (plugin.validateTransaction(transaction)) {
        emit('update:modelValue', transaction);
        return;
      }
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
  emit('update:modelValue', undefined);
};

const handleMethodChanged = () => {
  parameters.value = [];
  selectedMethod.value = methods.value[methodIndex.value];
  updateTransaction();
};

const handleABIChanged = (newValue: string) => {
  abi.value = newValue;
  methodIndex.value = 0;
  methods.value = [];

  try {
    methods.value = getABIWriteFunctions(abi.value);
    validAbi.value = true;
    handleMethodChanged();
  } catch (error) {
    validAbi.value = false;
    console.warn('error extracting useful methods', error);
  }
};

const handleAddressChanged = async () => {
  const result = await getContractABI(props.config.network, to.value);
  if (result && result !== abi.value) {
    abi.value = result;
    handleABIChanged(result);
  }
};

const handleValueChange = newValue => {
  value.value = newValue;
  try {
    parseAmount(newValue);
    validValue.value = true;
  } catch (error) {
    validValue.value = false;
  }
};

const handleParameterChanged = (index, newValue) => {
  parameters.value[index] = newValue;
  updateTransaction();
};

watch(
  [to, abi, value, selectedMethod, parameters, () => props.nonce],
  updateTransaction
);

onMounted(() => {
  if (props.modelValue) {
    to.value = props.modelValue.to || '';

    if (props.config.preview) {
      const transactionDecoder = new InterfaceDecoder(
        props.modelValue.abi || ''
      );
      selectedMethod.value = transactionDecoder.getMethodFragment(
        props.modelValue.data || ''
      );
      parameters.value = transactionDecoder.decodeFunction(
        props.modelValue.data || '',
        selectedMethod.value
      );

      methods.value = [selectedMethod.value];
      handleValueChange(props.modelValue.value || '0');
      handleABIChanged(
        typeof props.modelValue.abi === 'object'
          ? JSON.stringify(props.modelValue.abi)
          : props.modelValue.abi
      );
    } else {
      setTimeout(updateTransaction, 1000);
    }
  }
});
</script>

<template>
  <div class="space-y-2">
    <SafeSnapInputAddress
      v-model="to"
      :disabled="config.preview"
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

      <div
        v-if="selectedMethod && selectedMethod.inputs.length"
        class="space-y-2"
      >
        <SafeSnapInputMethodParameter
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
