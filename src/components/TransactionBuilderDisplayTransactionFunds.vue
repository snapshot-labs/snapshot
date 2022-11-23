<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { shortenAddress } from '@/helpers/utils';
import { decodeERC20TransferData } from '@/helpers/abi';
import { getTokenInfo } from '@/helpers/transactionBuilder';
import { getNativeCoinInfo, Transaction } from '@/helpers/safe';
import { useProfiles } from '@/composables';

const props = defineProps<{
  transaction: Transaction;
  network: string;
}>();

const { profiles, loadProfiles } = useProfiles();

const nativeCoinInfo = getNativeCoinInfo(props.network);

const recipient = ref<string>('');
const recipientENS = ref<string>('');
const amount = ref<BigNumber>(BigNumber.from(0));
const tokenAddress = ref<string>('');
const tokenName = ref<string>('');
const tokenSymbol = ref<string>('');
const tokenDecimals = ref<number>(0);

onMounted(async () => {
  if (props.transaction.data === '0x') {
    tokenAddress.value = '';
    recipient.value = props.transaction.to;
    amount.value = props.transaction.value;
    tokenName.value = nativeCoinInfo.name;
    tokenSymbol.value = nativeCoinInfo.symbol;
    tokenDecimals.value = nativeCoinInfo.decimals;
  } else {
    const params = decodeERC20TransferData(props.transaction.data);
    tokenAddress.value = props.transaction.to;
    recipient.value = params.recipient;
    amount.value = params.amount;
    const tokenInfo = await getTokenInfo(tokenAddress.value, props.network);
    tokenName.value = tokenInfo.name;
    tokenSymbol.value = tokenInfo.symbol;
    tokenDecimals.value = tokenInfo.decimals;
  }

  await loadProfiles([recipient.value]);
  recipientENS.value = profiles.value[recipient.value]?.ens || '';
});
</script>

<template>
  <div class="flex items-center">
    Transfer {{ formatUnits(amount, tokenDecimals) }}
    {{ tokenAddress ? tokenSymbol : nativeCoinInfo.name }} to
    {{ recipientENS || shortenAddress(recipient) }}
  </div>
</template>
