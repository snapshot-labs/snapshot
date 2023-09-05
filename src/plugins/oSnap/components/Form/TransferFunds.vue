<script setup lang="ts">
import { ETH_CONTRACT } from '@/helpers/constants';
import { TokenAsset } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import {
  getERC20TokenTransferTransactionData,
  getNativeAsset,
  transferFundsToModuleTransaction
} from '../../index';
import { Network, Token } from '../../types';
import InputAddress from '../Input/Address.vue';
import InputAmount from '../Input/Amount.vue';
import TokensModal from './TokensModal.vue';

const props = defineProps<{
  preview: boolean;
  modelValue:
    | {
        amount: string;
        recipient: string;
        token: TokenAsset;
      }
    | undefined;
  nonce: number;
  tokens: TokenAsset[];
  network: Network;
}>();

const emit = defineEmits(['update:modelValue']);

const nativeAsset = getNativeAsset(props.network);
const amount = ref('0');
const recipient = ref('');
const tokens = ref<Token[]>([nativeAsset, ...props.tokens]);
const isAmountValid = ref(true);
const isTokenModalOpen = ref(false);

function updateTransaction() {
  if (
    props.preview ||
    !isBigNumberish(amount.value) ||
    !isAddress(recipient.value)
  )
    return; 
}

onMounted(() => {
  if (props.modelValue) {
    amount.value = props.modelValue.amount ?? '0';
    recipient.value = props.modelValue.recipient ?? '';
    if (props.modelValue.token) {
      tokens.value = [props.modelValue.token];
    }
  }
});

export default {
  data() {
    const { amount = '0' } = this.modelValue || {};
    const nativeAsset = getNativeAsset(this.config.network);
    return {
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
    },
    shorten: shorten
  }
};
</script>

<template>
  <BaseButton
    class="mb-2 flex w-full flex-row items-center justify-between !px-3"
    @click="openModal()"
  >
    <div class="flex flex-row space-x-2">
      <span class="text-skin-text">{{ $t('safeSnap.asset') }}</span>
      <AvatarToken
        :address="
          selectedToken.address === 'main'
            ? ETH_CONTRACT
            : selectedToken.address
        "
        class="ml-2"
      />
      <span v-if="selectedToken">{{ selectedToken.symbol }}</span>
      <span>
        {{
          selectedToken.address === 'main'
            ? ''
            : `(${shorten(selectedToken.address)})`
        }}
      </span>
    </div>
    <i-ho-chevron-down class="text-xs text-skin-link" />
  </BaseButton>

  <div class="space-y-2">
    <InputAddress
      v-model="to"
      :disabled="config.preview"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
    />
    <InputAmount
      :key="selectedToken?.decimals"
      v-model="value"
      :label="$t('safeSnap.amount')"
      :decimals="selectedToken?.decimals"
      :disabled="config.preview"
    />
  </div>

  <teleport to="#modal">
    <TokensModal
      :tokens="tokens"
      :token-address="tokenAddress"
      :open="modalTokensOpen"
      :network="config.network"
      @token-address="tokenAddress = $event"
      @close="modalTokensOpen = false"
    />
  </teleport>
</template>
