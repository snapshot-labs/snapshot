<script setup lang="ts">
const props = defineProps<{
  network: string;
  contractAddress: string;
  token?: string;
}>();

const SUPPORTED_NETWORK = ['1', '5'];

function link() {
  if (!SUPPORTED_NETWORK.includes(props.network)) {
    return '';
  }

  return `https://${
    props.network === '5' ? 'testnets.' : ''
  }opensea.io/assets/${props.network === '5' ? 'goerli/' : '/'}${
    props.contractAddress
  }${props.token ? `/${props.token}` : ''}`;
}
</script>

<template>
  <BaseLink
    v-tippy="{
      content: `View this ${props.token ? 'token' : 'collection'} on OpenSea`
    }"
    :link="link()"
  >
    <IconOpensea />
  </BaseLink>
</template>
