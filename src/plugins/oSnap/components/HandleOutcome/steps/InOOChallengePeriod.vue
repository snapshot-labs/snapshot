<script setup lang="ts">
import { getOracleUiLink } from '@/plugins/oSnap/utils';
import { type Network } from '../../../types';
const props = defineProps<{
  network: Network;
  expirationTime: number;
  assertionHash: string;
  assertionLogIndex: string;
}>();

const oracleUiLink = getOracleUiLink(
  props.network,
  props.assertionHash,
  Number(props.assertionLogIndex)
);

const expirationDateLocaleString = new Date(
  props.expirationTime * 1000
).toLocaleString();
</script>

<template>
  <span>
    Transactions can be executed at
    <strong>{{ expirationDateLocaleString }}</strong>
  </span>

  <div>
    <a :href="oracleUiLink" rel="noreferrer noopener" target="_blank">
      UMA Oracle URL to dispute
      <span class="iconfont iconexternal-link" />
    </a>
  </div>
</template>
