<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';

const props = defineProps<{
  network: string;
  safeAddress: string;
}>();

const networkIcon = (network: string) => {
  const { logo } = networks[network];
  return getIpfsUrl(logo);
};

const networkName = (network: string) => {
  if (network === '1') return 'Mainnet';
  const { shortName, name } = networks[network] || {};
  return name || `#${network}`;
};
</script>

<template>
  <span class="flex items-center gap-1">
    <BaseAvatar
      class="float-left mr-2"
      :src="networkIcon(props.network)"
      size="28"
    />
    {{ networkName(props.network) }}
    Safe
    <p>
      {{ shorten(props.safeAddress) }}
    </p>
  </span>
</template>
