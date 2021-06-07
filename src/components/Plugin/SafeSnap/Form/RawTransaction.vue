<template>
  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :inputProps="{ required: true }"
    label="to (address)"
  />

  <UiInput
    v-model="value"
    :disabled="config.preview"
    :error="!isValidValue && 'Invalid Value'"
  >
    <template v-slot:label>value (wei)</template>
  </UiInput>

  <UiInput
    v-model="data"
    :disabled="config.preview"
    :error="!isValidData && 'Invalid Data'"
  >
    <template v-slot:label>Data</template>
  </UiInput>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import { isHexString } from '@ethersproject/bytes';
import { parseAmount } from '@/helpers/utils';

const toModuleTransaction = ({ to, value, data, nonce }) => {
  return {
    to,
    value,
    data,
    nonce,
    operation: '0'
  };
};
export default {
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue'],
  data() {
    return {
      plugin: new Plugin(),

      to: '',
      value: '0',
      data: ''
    };
  },
  mounted() {
    if (this.modelValue) {
      const { to = '', value = '0', data = '' } = this.modelValue;
      this.to = to;
      this.value = value;
      this.data = data;
    }
  },
  watch: {
    to() {
      this.updateTransaction();
    },
    value() {
      this.updateTransaction();
    },
    data() {
      this.updateTransaction();
    }
  },
  computed: {
    isValidValue() {
      if (!this.value.length) return true;
      try {
        parseAmount(this.value);
        return true;
      } catch (error) {
        return false;
      }
    },
    isValidData() {
      return !this.data.length || isHexString(this.data);
    }
  },
  methods: {
    updateTransaction() {
      if (this.config.preview) return;

      const transaction = toModuleTransaction({
        value: this.value,
        to: this.to,
        data: this.data,
        nonce: this.nonce
      });

      if (this.plugin.validateTransaction(transaction)) {
        this.$emit('update:modelValue', transaction);
        return;
      }
      this.$emit('update:modelValue', undefined);
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
