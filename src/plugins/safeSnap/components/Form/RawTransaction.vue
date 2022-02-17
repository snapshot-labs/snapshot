<script>
import Plugin, {
  decodeTransactionData,
  rawToModuleTransaction
} from '../../index';
import { isHexString } from '@ethersproject/bytes';
import { parseAmount } from '@/helpers/utils';
import SafeSnapInputAddress from '../Input/Address.vue';

export default {
  components: { SafeSnapInputAddress },
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
  async mounted() {
    if (this.modelValue) {
      const { to = '', value = '0', data = '' } = this.modelValue;
      this.to = to;
      this.value = value;
      this.data = data;

      if (this.config.preview) {
        try {
          const transaction = await decodeTransactionData(
            this.config.network,
            this.modelValue,
            this.config.multiSendAddress
          );
          if (this.plugin.validateTransaction(transaction)) {
            this.$emit('update:modelValue', transaction);
          }
        } catch (e) {
          console.warn('raw-transaction: failed to decode transaction');
        }
      }
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

      const transaction = rawToModuleTransaction({
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

<template>
  <SafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :inputProps="{ required: false }"
    :label="$t('safeSnap.to')"
  />

  <UiInput
    v-model="value"
    :disabled="config.preview"
    :error="!isValidValue && $t('safeSnap.invalidValue')"
  >
    <template v-slot:label>{{ $t('safeSnap.value') }}</template>
  </UiInput>

  <UiInput
    v-model="data"
    :disabled="config.preview"
    :error="!isValidData && $t('safeSnap.invalidData')"
  >
    <template v-slot:label>{{ $t('safeSnap.data') }}</template>
  </UiInput>
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
