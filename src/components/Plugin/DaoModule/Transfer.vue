<template>
  <span>Contract Interaction</span>

  <PluginDaoModuleInputAddress
    v-model="newEntry.to"
    :inputProps="{
      placeholder: 'Target address',
      required: true
    }"
    @validAddress="handleAddressChanged()"
  />

  <UiTextarea
    :error="!validAbi && 'Invalid ABI'"
    :modelValue="newEntry.abi"
    :textareaProps="{ placeholder: 'ABI' }"
    @update:modelValue="handleABIChanged($event)"
  ></UiTextarea>

  <UiInput
    :error="!validValue && 'Invalid Value'"
    :modelValue="newEntry.value"
    placeholder="Value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>Value</template>
  </UiInput>

  <div v-if="methods.length">
    <span>Methods</span>
    <UiButton class="width-full mb-2">
      <select
        v-model="methodIndex"
        class="input width-full text-center"
        required
        @change="handleMethodChanged()"
      >
        <option v-for="(method, i) in methods" :key="i" :value="i">
          {{ method.name }}
        </option>
      </select>
    </UiButton>

    <div v-if="selectedMethod && selectedMethod.inputs.length">
      <span>Parameters</span>
      <PluginDaoModuleInputMethodParameter
        v-for="input in selectedMethod.inputs"
        :key="input.name"
        v-model="parameters[input.name]"
        :name="input.name"
        :type="input.type"
        @isValid="validParameters[input.name] = $event"
      />
    </div>
  </div>

  <UiButton class="mb-2" @click="close">Back</UiButton>
  <UiButton :disabled="!isValid" class="button--submit" @click="handleSubmit">
    Add
  </UiButton>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/daoModule';
import { parseEther } from '@ethersproject/units';
import {
  extractUsefulMethods,
  getContractABI,
  getTransactionData
} from '@/helpers/abi/utils';
import { BigNumber } from '@ethersproject/bignumber';

const defaultEntry = () => {
  return {
    operation: '0',
    value: '0'
  };
};
const parseValueInput = input => {
  try {
    return parseEther(input).toString();
  } catch (e) {
    return input;
  }
};
const toModuleTransaction = (tx, data, nonce) => {
  return {
    nonce,
    to: tx.to,
    value: parseValueInput(tx.value),
    data: data,
    operation: tx.operation
  };
};
export default {
  props: ['input', 'nonce', 'network'],
  emits: ['newTransaction', 'close'],
  data() {
    return {
      plugin: new Plugin(),
      newEntry: defaultEntry(),
      validAbi: true,
      validValue: true,
      selectedMethod: undefined,
      methods: [],
      methodIndex: 0,
      parameters: {},
      validParameters: {}
    };
  },
  computed: {
    isValid() {
      try {
        const data = getTransactionData(
          this.newEntry.abi,
          this.selectedMethod,
          this.newEntry.to,
          this.parameters
        );
        // We validate with nonce 0 here and use the correct index as nonce later
        return this.plugin.validateTransaction(
          toModuleTransaction(this.newEntry, data, 0)
        );
      } catch (error) {
        return false;
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleSubmit() {
      const data = getTransactionData(
        this.newEntry.abi,
        this.selectedMethod,
        this.newEntry.to,
        this.parameters
      );

      const transaction = toModuleTransaction(this.newEntry, data, this.nonce);
      this.$emit('newTransaction', transaction);
      this.$emit('close');
    },
    async handleAddressChanged() {
      const result = await getContractABI(this.network, this.newEntry.to);
      if (result) {
        this.newEntry.abi = result;
        this.handleABIChanged(result);
      }
    },
    handleValueChange(value) {
      this.newEntry.value = value;
      try {
        BigNumber.from(value);
        this.validValue = true;
      } catch (error) {
        this.validValue = false;
      }
    },
    handleABIChanged(value) {
      this.newEntry.abi = value;
      this.methodIndex = 0;
      this.methods = [];

      let abi;
      try {
        abi = JSON.parse(this.newEntry.abi);
        this.validAbi = true;
      } catch (error) {
        this.validAbi = false;
        console.warn('invalid abi', error);
      }

      try {
        this.methods = extractUsefulMethods(abi);
        this.handleMethodChanged();
      } catch (error) {
        console.warn('error extracting useful methods', error);
      }
    },
    handleMethodChanged() {
      this.parameters = {};
      this.selectedMethod = this.methods[this.methodIndex];

      // Set all parameters valid state to false as all parameters are empty by default
      // This takes the `inputs` array (Ex: [{name:'param1', ...}, {name:'param2', ...}, ...])
      // And converts it to {param1: false, param2: false, ...}
      this.validParameters = Object.fromEntries(
        Object.keys(this.selectedMethod.inputs).map(({ name }) => [name, false])
      );
    },
    areParametersValid() {
      const values = Object.values(this.validParameters);
      return values.every(value => value);
    }
  }
};
</script>

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
</style>
