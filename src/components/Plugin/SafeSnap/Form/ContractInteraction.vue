<template>
  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="preview"
    :inputProps="{
      required: true
    }"
    label="to (address)"
    @validAddress="handleAddressChanged()"
  />

  <UiInput
    :disabled="preview"
    :error="!validValue && 'Invalid Value'"
    :modelValue="value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>value (wei)</template>
  </UiInput>

  <UiInput
    :disabled="preview"
    :error="!validAbi && 'Invalid ABI'"
    :modelValue="abi"
    @update:modelValue="handleABIChanged($event)"
  >
    <template v-slot:label>ABI</template>
  </UiInput>

  <div v-if="methods.length">
    <UiSelect
      v-model="methodIndex"
      :disabled="preview"
      @change="handleMethodChanged()"
    >
      <template v-slot:label>function</template>
      <option v-for="(method, i) in methods" :key="i" :value="i">
        {{ method.name }}()
      </option>
    </UiSelect>

    <div v-if="selectedMethod && selectedMethod.inputs.length">
      <div class="divider"></div>

      <PluginSafeSnapInputMethodParameter
        v-for="input in selectedMethod.inputs"
        :key="input.name"
        :disabled="preview"
        :modelValue="parameters[input.name]"
        :name="input.name"
        :type="input.type"
        @update:modelValue="handleParameterChanged(input.name, $event)"
      />
    </div>
  </div>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import {
  extractUsefulMethods,
  getContractABI,
  getTransactionData,
  parseMethodToABI
} from '@/helpers/abi/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { Interface } from '@ethersproject/abi';
import { isArrayParameter } from '@/helpers/validator';

const parseAmount = input => {
  return BigNumber.from(input).toString();
};
const parseValueInput = input => {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
};
const toModuleTransaction = ({ to, value, data, nonce, method }) => {
  return {
    to,
    data,
    nonce,
    operation: '0',
    type: 'contractInteraction',
    value: parseValueInput(value),
    abi: parseMethodToABI(method)
  };
};
export default {
  props: ['modelValue', 'nonce', 'network', 'preview'],
  emits: ['update:modelValue'],
  data() {
    return {
      plugin: new Plugin(),

      to: '',
      abi: '',
      value: '0',

      validAbi: true,
      validValue: true,
      selectedMethod: undefined,
      methods: [],
      methodIndex: 0,
      parameters: {}
    };
  },
  mounted() {
    if (this.modelValue) {
      const { to = '', abi = '', value = '0', data } = this.modelValue;
      this.to = to;

      if (this.preview) {
        this.abi = JSON.stringify(abi);
        this.value = value;
        this.selectedMethod = abi[0];
        this.methods = [this.selectedMethod];
        const contractInterface = new Interface(abi);
        const methodParametersValues = contractInterface.decodeFunctionData(
          this.selectedMethod.name,
          data
        );
        console.log('methodParametersValues', methodParametersValues);
        this.parameters = this.selectedMethod.inputs.reduce(
          (obj, parameter) => {
            const value = isArrayParameter(parameter.type)
              ? JSON.stringify(
                  methodParametersValues[parameter.name].map(value =>
                    value.toString()
                  )
                )
              : methodParametersValues[parameter.name].toString();
            return {
              ...obj,
              [parameter.name]: value
            };
          },
          {}
        );
      } else {
        this.handleValueChange(value);
        this.handleABIChanged(
          typeof abi === 'object' ? JSON.stringify(abi) : abi
        );
      }
    }
  },
  watch: {
    to() {
      this.updateTransaction();
    },
    abi() {
      this.updateTransaction();
    },
    value() {
      this.updateTransaction();
    },
    selectedMethod() {
      this.updateTransaction();
    },
    parameters() {
      this.updateTransaction();
    },
    nonce() {
      this.updateTransaction();
    }
  },
  methods: {
    updateTransaction() {
      if (this.preview) return;
      try {
        if (isBigNumberish(this.value) && isAddress(this.to)) {
          const data = getTransactionData(
            this.abi,
            this.selectedMethod,
            this.to,
            this.parameters
          );

          const transaction = toModuleTransaction({
            data,
            to: this.to,
            value: this.value,
            nonce: this.nonce,
            method: this.selectedMethod
          });

          if (this.plugin.validateTransaction(transaction)) {
            this.$emit('update:modelValue', transaction);
            return;
          }
        }
      } catch (error) {
        console.warn('invalid transaction');
      }
      this.$emit('update:modelValue', undefined);
    },
    async handleAddressChanged() {
      const result = await getContractABI(this.network, this.to);
      if (result && result !== this.abi) {
        this.abi = result;
        this.handleABIChanged(result);
      }
    },
    handleValueChange(value) {
      this.value = value;
      try {
        parseAmount(value);
        this.validValue = true;
      } catch (error) {
        this.validValue = false;
      }
    },
    handleABIChanged(value) {
      this.abi = value;
      this.methodIndex = 0;
      this.methods = [];

      let abi;
      try {
        abi = JSON.parse(this.abi);
        this.validAbi = true;
      } catch (error) {
        this.validAbi = false;
        console.warn('invalid abi', error);
        return;
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
      this.updateTransaction();
    },
    handleParameterChanged(parameter, value) {
      this.parameters[parameter] = value;
      this.updateTransaction();
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

.divider {
  border-top: 1px solid #cacaca;
  margin-top: 16px;
  margin-bottom: 24px;
}
</style>
