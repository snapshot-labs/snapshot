<script>
import Plugin from '@/../snapshot-plugins/src/plugins/safeSnap';
import {
  contractInteractionToModuleTransaction,
  getABIWriteFunctions,
  getContractABI,
  getContractTransactionData
} from '@/helpers/abi/utils';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { parseAmount } from '@/helpers/utils';
import { InterfaceDecoder } from '@/helpers/abi/decoder';

export default {
  props: ['modelValue', 'nonce', 'config'],
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
      parameters: []
    };
  },
  mounted() {
    if (this.modelValue) {
      const { to = '', abi = '', value = '0', data } = this.modelValue;
      this.to = to;

      if (this.config.preview) {
        const transactionDecoder = new InterfaceDecoder(abi);
        this.selectedMethod = transactionDecoder.getMethodFragment(data);
        this.parameters = transactionDecoder.decodeFunction(
          data,
          this.selectedMethod
        );

        this.abi = JSON.stringify(abi);
        this.value = value;
        this.methods = [this.selectedMethod];
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
      if (this.config.preview) return;
      try {
        if (isBigNumberish(this.value) && isAddress(this.to)) {
          const data = getContractTransactionData(
            this.abi,
            this.selectedMethod,
            this.parameters
          );

          const transaction = contractInteractionToModuleTransaction({
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
      const result = await getContractABI(this.config.network, this.to);
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

      try {
        this.methods = getABIWriteFunctions(this.abi);
        this.validAbi = true;
        this.handleMethodChanged();
      } catch (error) {
        this.validAbi = false;
        console.warn('error extracting useful methods', error);
      }
    },
    handleMethodChanged() {
      this.parameters = [];
      this.selectedMethod = this.methods[this.methodIndex];
      this.updateTransaction();
    },
    handleParameterChanged(index, value) {
      this.parameters[index] = value;
      this.updateTransaction();
    }
  }
};
</script>

<template>
  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :inputProps="{
      required: true
    }"
    label="to (address)"
    @validAddress="handleAddressChanged()"
  />

  <UiInput
    :disabled="config.preview"
    :error="!validValue && 'Invalid Value'"
    :modelValue="value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>value (wei)</template>
  </UiInput>

  <UiInput
    :disabled="config.preview"
    :error="!validAbi && 'Invalid ABI'"
    :modelValue="abi"
    @update:modelValue="handleABIChanged($event)"
  >
    <template v-slot:label>ABI</template>
  </UiInput>

  <div v-if="methods.length">
    <UiSelect
      v-model="methodIndex"
      :disabled="config.preview"
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
        v-for="(input, index) in selectedMethod.inputs"
        :key="input.name"
        :disabled="config.preview"
        :modelValue="parameters[index]"
        :name="input.name"
        :type="input.type"
        @update:modelValue="handleParameterChanged(index, $event)"
      />
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
