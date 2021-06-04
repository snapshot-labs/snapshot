<template>
  <UiSelect v-model="asset" :disabled="preview">
    <template v-slot:label>
      asset
      <img
        v-if="asset !== undefined"
        :src="erc20Tokens[asset].image"
        alt="TOKEN"
        class="tokenImage"
      />
    </template>
    <option v-for="(token, index) in erc20Tokens" :key="index" :value="index">
      {{ token.name }}
    </option>
  </UiSelect>

  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="preview"
    :inputProps="{
      required: true
    }"
    label="to"
  />

  <UiInput
    :disabled="preview"
    :error="!validValue && 'Invalid Value'"
    :modelValue="value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>amount</template>
  </UiInput>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import { Erc20TokenList } from '@snapshot-labs/snapshot.js/src/plugins/safeSnap/erc20TokenList';
import {
  getERC20TokenTransferTransactionData,
  getOperation
} from '@/helpers/abi/utils';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { parseAmount, parseValueInput } from '@/helpers/utils';

const toModuleTransaction = ({
  to,
  recipient,
  amount,
  token,
  value,
  data,
  nonce
}) => {
  return {
    to,
    data,
    nonce,
    token,
    amount,
    recipient,
    operation: getOperation(to),
    type: 'transferFunds',
    value: parseValueInput(value)
  };
};

export default {
  props: ['modelValue', 'nonce', 'network', 'preview'],
  emits: ['update:modelValue'],
  data() {
    return {
      plugin: new Plugin(),
      erc20Tokens: Erc20TokenList,
      to: '',
      asset: 0,
      value: '0',
      validValue: true
    };
  },
  mounted() {
    if (this.modelValue) {
      const { recipient = '', token, amount = '0' } = this.modelValue;
      this.to = recipient;
      this.handleValueChange(amount);
      this.asset = this.erc20Tokens.findIndex(t => t.address === token.address);
    }
  },
  watch: {
    to() {
      this.updateTransaction();
    },
    asset() {
      this.updateTransaction();
    },
    value() {
      this.updateTransaction();
    }
  },
  methods: {
    updateTransaction() {
      if (this.preview) return;
      try {
        if (isBigNumberish(this.value) && isAddress(this.to)) {
          const token = Erc20TokenList[this.asset];
          const data = getERC20TokenTransferTransactionData(
            this.to,
            this.value
          );

          const transaction = toModuleTransaction({
            data,
            token,
            value: 0,
            to: token.address,
            recipient: this.to,
            amount: this.value,
            nonce: this.nonce
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
    handleValueChange(value) {
      this.value = value;
      try {
        parseAmount(value);
        this.validValue = true;
      } catch (error) {
        this.validValue = false;
      }
    }
  }
};
</script>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
