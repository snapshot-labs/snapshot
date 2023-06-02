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
import SafeSnapTokensModal from './TokensModal.vue';
import { ETH_CONTRACT } from '@/helpers/constants';

export default {
  components: {
    SafeSnapInputAddress,
    SafeSnapInputAmount,
    SafeSnapTokensModal
  },
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

      validValue: true,
      modalTokensOpen: false,
      ETH_CONTRACT: ETH_CONTRACT
    };
  },
  computed: {
    selectedToken() {
      return this.tokens.find(token => token.address === this.tokenAddress);
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
    },
    openModal() {
      if (!this.config.tokens.length) return;
      this.modalTokensOpen = true;
    }
  }
};
</script>

<template>
  <BaseButton
    class="mb-2 flex w-full flex-row items-center justify-between !px-3"
    @click="openModal()"
  >
    <div class="flex flex-row">
      <span class="text-skin-text">{{ $t('safeSnap.asset') }}</span>
      <span v-if="selectedToken" class="mx-2">{{ selectedToken.symbol }}</span>
      <AvatarToken
        :address="
          selectedToken.address === 'main'
            ? ETH_CONTRACT
            : selectedToken.address
        "
      />
    </div>
    <i-ho-chevron-down class="text-xs text-skin-link" />
  </BaseButton>

  <div class="space-y-2">
    <SafeSnapInputAddress
      v-model="to"
      :disabled="config.preview"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
    />
    <SafeSnapInputAmount
      :key="selectedToken?.decimals"
      v-model="value"
      :label="$t('safeSnap.amount')"
      :decimals="selectedToken?.decimals"
      :disabled="config.preview"
    />
  </div>

  <teleport to="#modal">
    <SafeSnapTokensModal
      :tokens="tokens"
      :token-address="tokenAddress"
      :open="modalTokensOpen"
      @token-address="tokenAddress = $event"
      @close="modalTokensOpen = false"
    />
  </teleport>
</template>
