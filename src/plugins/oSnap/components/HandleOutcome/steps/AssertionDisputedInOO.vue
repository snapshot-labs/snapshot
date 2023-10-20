<script setup lang="ts">
import { getOracleUiLink } from '@/plugins/oSnap/utils';
import { type Network } from '../../../types';
const props = defineProps<{
  network: Network;
  assertionHash: string;
  assertionLogIndex: string;
}>();

const oracleUiLink = getOracleUiLink(
  props.network,
  props.assertionHash,
  Number(props.assertionLogIndex)
);
</script>

<template>
  <span>
    This proposal was disputed in the Optimistic Oracle. It can only be executed if it passes a vote in the Oracle.
  </span>

  <div>
    <a :href="oracleUiLink" rel="noreferrer noopener" target="_blank">
      UMA Oracle URL
      <span class="iconfont iconexternal-link" />
    </a>
  </div>
  <div>
    <a href="https://vote.uma.xyz" rel="noreferrer noopener" target="_blank">
      UMA Voting Dapp URL
      <span class="iconfont iconexternal-link" />
    </a>
  </div>
</template>
