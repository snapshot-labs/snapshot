<script setup lang="ts">
import { getOracleUiLink } from '@/plugins/oSnap/utils';
import { type Network } from '../../../types';
const props = defineProps<{
  network: Network;
  proposalTxHash: string;
  logIndex: number | string;
}>();

const oracleUiLink = getOracleUiLink(
  props.network,
  props.proposalTxHash,
  Number(props.logIndex)
);
</script>

<template>
  <span>
    Proposal cannot be executed because it was disputed in the Oracle and failed
    to pass the vote.
  </span>

  <div>
    <a :href="oracleUiLink" rel="noreferrer noopener" target="_blank">
      UMA Oracle URL
      <span class="iconfont iconexternal-link" />
    </a>
  </div>
</template>
