<script setup lang="ts">
import { ERC20_ABI } from '@/helpers/abi';
import { CollectableTransaction } from '@/helpers/transactionBuilder';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { inject, onMounted, reactive } from 'vue';

const props = defineProps<{
  transaction: CollectableTransaction;
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
  const [[name], [symbol]] = await multicall(
    network,
    getProvider(network),
    ERC20_ABI,
    [
      [props.transaction.collectableAddress, 'name', []],
      [props.transaction.collectableAddress, 'symbol', []]
    ]
  );
  tokenInfo.name = name;
  tokenInfo.symbol = symbol;

  // TODO: lookup recipient ens name
});
</script>

<template>
  Send {{ tokenInfo.name }} ({{ tokenInfo.symbol }} #{{
    transaction.collectableId
  }}) to {{ transaction.recipient }}
</template>
