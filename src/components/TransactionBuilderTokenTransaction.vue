<script setup lang="ts">
import { ERC20_ABI } from '@/helpers/abi';
import { TokenTransaction } from '@/helpers/transactionBuilder';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { inject, onMounted, reactive } from 'vue';

const props = defineProps<{
  transaction: TokenTransaction;
}>();

const network = inject('network') as string;

const tokenInfo: {
  name: string;
  symbol: string;
  decimals: number;
} = reactive({
  name: '',
  symbol: '',
  decimals: 18
});

onMounted(async () => {
  const [[name], [symbol], [decimals]] = await multicall(
    network,
    getProvider(network),
    ERC20_ABI,
    [
      [props.transaction.tokenAddress, 'name', []],
      [props.transaction.tokenAddress, 'symbol', []],
      [props.transaction.tokenAddress, 'decimals', []]
    ]
  );
  tokenInfo.name = name;
  tokenInfo.symbol = symbol;
  tokenInfo.decimals = decimals;

  // TODO: lookup recipient ens name
});
</script>

<template>
  Send {{ transaction.amount }} {{ tokenInfo.symbol }} to
  {{ transaction.recipient }}
</template>
