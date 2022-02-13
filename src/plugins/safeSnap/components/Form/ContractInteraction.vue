<script>
import Plugin, {
  contractInteractionToModuleTransaction,
  getABIWriteFunctions,
  getContractABI,
  getContractTransactionData,
  InterfaceDecoder
} from '@/../snapshot-plugins/src/plugins/safeSnap';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { parseAmount } from '@/helpers/utils';

export default {
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue'],
  data() {
    let to = '';
    let abi = '';
    let value = '0';
    let selectedMethod = undefined;
    let methods = [];
    let parameters = [];

    if (this.modelValue) {
      try {
        const {
          to: _to = '',
          abi: _abi = '',
          value: _value = '0',
          data
        } = this.modelValue;

        to = _to;
        abi = typeof _abi === 'object' ? JSON.stringify(_abi) : _abi;
        value = _value;

        const transactionDecoder = new InterfaceDecoder(abi);
        selectedMethod = transactionDecoder.getMethodFragment(data);
        parameters = transactionDecoder.decodeFunction(data, selectedMethod);
        methods = [selectedMethod];
      } catch (err) {
        console.error('error decoding contract interaction tx', err);
      }
    }

    return {
      plugin: new Plugin(),

      to,
      abi,
      value,

      validAbi: true,
      validValue: true,
      methodIndex: 0,
      selectedMethod,
      methods,
      parameters
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

        this.methods = [this.selectedMethod];
        this.handleValueChange(value);
        this.handleABIChanged(
          typeof abi === 'object' ? JSON.stringify(abi) : abi
        );
      } else {
        setTimeout(() => this.updateTransaction(), 1000);
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

          const transaction = contractInteractionToModuleTransaction(
            {
              data,
              to: this.to,
              value: this.value,
              nonce: this.nonce,
              method: this.selectedMethod
            },
            this.config.multiSendAddress
          );

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
    :label="$t('safeSnap.to')"
    @validAddress="handleAddressChanged()"
  />

  <UiInput
    :disabled="config.preview"
    :error="!validValue && $t('safeSnap.invalidValue')"
    :modelValue="value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>{{ $t('safeSnap.value') }}</template>
  </UiInput>

  <UiInput
    :disabled="config.preview"
    :error="!validAbi && $t('safeSnap.invalidAbi')"
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
        :parameter="input"
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
