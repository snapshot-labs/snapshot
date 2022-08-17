<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { validateTransaction } from '../../index';
import { transferFundsToModuleTransaction } from '@/plugins/safeSnap/utils/transactions';
import { getERC20TokenTransferTransactionData } from '@/plugins/safeSnap/utils/abi';
import { getNativeAsset } from '@/plugins/safeSnap/utils/coins';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import SafeSnapInputAddress from '../Input/Address.vue';
import SafeSnapInputAmount from '../Input/Amount.vue';

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue']);

const nativeAsset = getNativeAsset(props.config.network);

const tokens = ref([nativeAsset]);

const to = ref('');
const value = ref(props.modelValue?.amount || '0');
const tokenAddress = ref('main');

const selectedToken = computed(() => {
  return (
    tokens.value.find(token => token.address === tokenAddress.value) ||
    nativeAsset
  );
});

const updateTransaction = () => {
  try {
    if (isBigNumberish(value.value) && isAddress(to.value)) {
      const data =
        selectedToken.value?.address === 'main'
          ? '0x'
          : getERC20TokenTransferTransactionData(to.value, value.value);

      const transaction = transferFundsToModuleTransaction({
        data,
        nonce: props.nonce,
        amount: value.value,
        recipient: to.value,
        token: selectedToken.value
      });

      if (validateTransaction(transaction)) {
        emit('update:modelValue', transaction);
        return;
      }
    }
  } catch (error) {
    console.warn('invalid transaction', error);
  }
  emit('update:modelValue', undefined);
};

const setTokens = () => {
  if (props.config.tokens) {
    tokens.value = [nativeAsset, ...props.config.tokens];
  }
};

watch([to, tokenAddress, value, () => props.config], () => {
  updateTransaction();
  setTokens();
});

onMounted(() => {
  setTokens();
  if (props.modelValue) {
    const { recipient = '', token, amount = '0' } = props.modelValue;
    to.value = recipient;
    value.value = amount;
    if (token) {
      tokenAddress.value = token.address;
    }
  }
});
</script>

<template>
  <UiSelect v-model="tokenAddress">
    <template #label>{{ $t('safeSnap.asset') }}</template>
    <template v-if="selectedToken.logoUri" #image>
      <img :src="selectedToken.logoUri" alt="" class="ml-2 w-4 align-middle" />
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
    />
  </div>
</template>
