<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

const props = defineProps<{
  network: string;
  contractAddress: string;
  token?: string;
}>();

function link() {
  return explorerUrl(
    props.network,
    `${props.contractAddress}${props.token ? `?a=${props.token}` : ''}`,
    props.token ? 'token' : 'address'
  );
}
</script>

<template>
  <BaseLink
    v-tippy="{
      content: `View this ${props.token ? 'token' : 'contract'} on Etherscan`
    }"
    :link="link()"
    hide-external-icon
  >
    <IconEtherscan />
  </BaseLink>
</template>
