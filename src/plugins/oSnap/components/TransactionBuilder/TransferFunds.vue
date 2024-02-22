<script setup lang="ts">
import { ETH_CONTRACT } from '@/helpers/constants';
import { shorten } from '@/helpers/utils';
import { Network, Token, TransferFundsTransaction } from '../../types';
import {
  createTransferFundsTransaction,
  getERC20TokenTransferTransactionData,
  getNativeAsset,
  isTransferFundsValid
} from '../../utils';
import AddressInput from '../Input/Address.vue';
import AmountInput from '../Input/Amount.vue';
import TokensModal from './TokensModal.vue';

const props = defineProps<{
  network: Network;
  tokens: Token[];
  transaction: TransferFundsTransaction;
  setTransactionAsInvalid: () => void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TransferFundsTransaction];
}>();

const amount = ref(props.transaction.amount ?? '');
const recipient = ref(props.transaction.recipient ?? '');
const tokens = ref<Token[]>(props.tokens);

const selectedTokenAddress = ref<Token['address']>(
  props.transaction?.token?.address ?? 'main'
);

const selectedToken = computed(
  () =>
    tokens.value.find(token => token.address === selectedTokenAddress.value) ??
    tokens.value.find(token => !token.address) ??
    tokens.value[0]
);

const isTokenModalOpen = ref(false);

function updateTransaction() {
  try {
    if (
      !isTransferFundsValid({
        amount: amount.value,
        recipient: recipient.value,
        token: selectedToken.value
      })
    ) {
      throw new Error('Validation error');
    }
    const data =
      selectedToken.value.address === 'main'
        ? '0x'
        : getERC20TokenTransferTransactionData(recipient.value, amount.value);
    const transaction = createTransferFundsTransaction({
      data,
      amount: amount.value,
      recipient: recipient.value,
      token: selectedToken.value
    });
    emit('updateTransaction', transaction);
  } catch {
    props.setTransactionAsInvalid();
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
      :enforcePositiveValue="true"
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
