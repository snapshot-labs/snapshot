<script setup lang="ts">
import { ETH_CONTRACT } from '@/helpers/constants';
import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { Network, Token, TransferFundsTransaction } from '../../types';
import {
  createTransferFundsTransaction,
  getERC20TokenTransferTransactionData,
  getNativeAsset,
  validateTransaction
} from '../../utils';
import AddressInput from '../Input/Address.vue';
import AmountInput from '../Input/Amount.vue';
import TokensModal from './TokensModal.vue';

const props = defineProps<{
  network: Network;
  tokens: Token[];
  transaction: TransferFundsTransaction;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TransferFundsTransaction];
}>();

const nativeAsset = getNativeAsset(props.network);
const amount = ref(props.transaction.amount ?? '');
const recipient = ref(props.transaction.recipient ?? '');
const tokens = ref<Token[]>([nativeAsset, ...props.tokens]);
const selectedTokenAddress = ref<Token['address']>(
  props.transaction?.token?.address ?? 'main'
);
const selectedToken = computed(
  () =>
    tokens.value.find(token => token.address === selectedTokenAddress.value) ??
    nativeAsset
);
const selectedTokenIsNative = computed(
  () => selectedToken.value?.address === 'main'
);
const isTokenModalOpen = ref(false);

function updateTransaction() {
  if (!isBigNumberish(amount.value) || !isAddress(recipient.value)) return;

  try {
    const data = selectedTokenIsNative.value
      ? '0x'
      : getERC20TokenTransferTransactionData(recipient.value, amount.value);

    const transaction = createTransferFundsTransaction({
      data,
      amount: amount.value,
      recipient: recipient.value,
      token: selectedToken.value
    });
    const isTransactionValid = validateTransaction(transaction);
    if (isTransactionValid) {
      emit('updateTransaction', transaction);
      return;
    }
  } catch (error) {
    console.warn('invalid transaction', error);
  }
}

function openModal() {
  isTokenModalOpen.value = true;
}

watch(recipient, updateTransaction);
watch(amount, updateTransaction);
watch(selectedTokenAddress, updateTransaction);
</script>

<template>
  <TuneButton
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
  </TuneButton>

  <div class="space-y-2">
    <AddressInput v-model="recipient" :label="$t('safeSnap.to')" />
    <AmountInput
      :key="selectedToken?.decimals"
      v-model="amount"
      :label="$t('safeSnap.amount')"
      :decimals="selectedToken?.decimals"
    />
  </div>

  <teleport to="#modal">
    <TokensModal
      :tokens="tokens"
      :token-address="selectedTokenAddress"
      :open="isTokenModalOpen"
      :network="network"
      @token-address="selectedTokenAddress = $event"
      @close="isTokenModalOpen = false"
    />
  </teleport>
</template>
