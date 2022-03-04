<script>
import Plugin, {
  getERC20TokenTransferTransactionData,
  getNativeAsset,
  transferFundsToModuleTransaction
} from '../../index';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import SafeSnapInputAddress from '../Input/Address.vue';
import SafeSnapInputAmount from '../Input/Amount.vue';

export default {
  components: { SafeSnapInputAddress, SafeSnapInputAmount },
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue'],
  data() {
    const { amount = '0' } = this.modelValue || {};
    const nativeAsset = getNativeAsset(this.config.network);
    return {
      plugin: new Plugin(),
      tokens: [nativeAsset],

      to: '',
      value: amount,
      tokenAddress: 'main',

      validValue: true
    };
  },
  computed: {
    selectedToken() {
      return this.tokens.find(token => token.address === this.tokenAddress);
    }
  },
  mounted() {
    this.setTokens();
    if (this.modelValue) {
      const { recipient = '', token, amount = '0' } = this.modelValue;
      this.to = recipient;
      this.value = amount;
      if (token) {
        this.tokenAddress = token.address;
        this.tokens = [token];
      }
    }
  },
  watch: {
    to() {
      this.updateTransaction();
    },
    tokenAddress() {
      this.updateTransaction();
    },
    value() {
      this.updateTransaction();
    },
    config() {
      this.setTokens();
    }
  },
  methods: {
    updateTransaction() {
      if (this.config.preview) return;
      try {
        if (isBigNumberish(this.value) && isAddress(this.to)) {
          const data =
            this.selectedToken.address === 'main'
              ? '0x'
              : getERC20TokenTransferTransactionData(this.to, this.value);

          const transaction = transferFundsToModuleTransaction({
            data,
            nonce: this.nonce,
            amount: this.value,
            recipient: this.to,
            token: this.selectedToken
          });

          if (this.plugin.validateTransaction(transaction)) {
            this.$emit('update:modelValue', transaction);
            return;
          }
        }
      } catch (error) {
        console.warn('invalid transaction', error);
      }
      this.$emit('update:modelValue', undefined);
    },
    setTokens() {
      if (!this.config.preview && this.config.tokens) {
        this.tokens = [
          getNativeAsset(this.config.network),
          ...this.config.tokens
        ];
      }
    }
  }
};
</script>

<template>
  <UiSelect v-model="tokenAddress" :disabled="config.preview">
    <template v-slot:label>{{ $t('safeSnap.asset') }}</template>
    <template v-slot:image v-if="selectedToken">
      <img :src="selectedToken.logoUri" alt="" class="tokenImage" />
    </template>
    <option
      v-for="(token, index) in tokens"
      :key="index"
      :value="token.address"
    >
      {{ token.symbol }}
    </option>
  </UiSelect>
  <div class="space-y-2">
    <SafeSnapInputAddress
      v-model="to"
      :disabled="config.preview"
      :inputProps="{
        required: true
      }"
      :label="$t('safeSnap.to')"
    />
    <SafeSnapInputAmount
      :label="$t('safeSnap.amount')"
      v-model="value"
      :decimals="selectedToken?.decimals"
      :disabled="config.preview"
    />
  </div>
</template>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
