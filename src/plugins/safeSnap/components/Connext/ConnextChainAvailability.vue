<script setup lang="ts">
import { computed } from 'vue';
import { getConstants } from '../../constants';

type ConnextChainAvailability = {
  network: string;
};
const props = defineProps<ConnextChainAvailability>();

const MAINNET_CHAINS = ['Ethereum', 'Polygon', 'BNB Chain', 'Gnosis Chain'];
const TESTNET_CHAINS = [
  'Mumbai',
  'Arbitrum Goerli',
  'zkSyncEra Testnet',
  'linea Testnet'
];

const isMainnet = computed(() => {
  const { MAINNET_CHAINS } = getConstants();
  return MAINNET_CHAINS.includes(props.network);
});
</script>

<template>
  <p>
    Apologies, Connext is currently not available on this chain as an origin.
    However, Connext is supported on the following chains:
  </p>
  <br />
  <li
    v-for="chain in !isMainnet ? MAINNET_CHAINS : TESTNET_CHAINS"
    :key="chain"
  >
    {{ chain }}
  </li>
  <br />
  <p>
    Please select one of these available chains to proceed with your
    transaction.
  </p>
</template>
ƒ
