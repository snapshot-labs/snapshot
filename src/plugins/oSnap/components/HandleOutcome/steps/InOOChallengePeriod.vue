<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { type Network } from '../../../types';
const props = defineProps<{
  network: Network;
  expirationTimestamp: BigNumber;
  proposalTxHash: string;
  logIndex: number;
}>();

const oracleUiLink = getOracleUiLink(
  props.network,
  props.proposalTxHash,
  props.logIndex
);

const expirationDateLocaleString = new Date(
  props.expirationTimestamp.toNumber() * 1000
).toLocaleString();

function getOracleUiLink(chain: string, txHash: string, logIndex: number) {
  if (Number(chain) !== 5 && Number(chain) !== 80001) {
    return `https://oracle.uma.xyz?transactionHash=${txHash}&eventIndex=${logIndex}`;
  }
  return `https://testnet.oracle.uma.xyz?transactionHash=${txHash}&eventIndex=${logIndex}`;
}
</script>

<template>
  <span>
    Proposal can be executed at
    <strong>{{ expirationDateLocaleString }}</strong>
  </span>

  <div>
    <a :href="oracleUiLink" rel="noreferrer noopener" target="_blank">
      UMA Oracle URL to dispute
      <span class="iconfont iconexternal-link" />
    </a>
  </div>
</template>
