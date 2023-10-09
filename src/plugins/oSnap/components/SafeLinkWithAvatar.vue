<script setup lang="ts">
import { getIpfsUrl, shorten } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { GnosisSafe } from '../types';
import { getSafeAppLink } from '../utils';

const props = defineProps<{
  safe: GnosisSafe;
}>();

const safeLink = computed(() =>
  getSafeAppLink(props.safe.network, props.safe.safeAddress)
);
const networkLogo = networks[props.safe.network].logo;
const networkLogoUrl = getIpfsUrl(networkLogo) as string;
</script>

<template>
  <span class="inline-flex items-center">
    <BaseAvatar class="" :src="networkLogoUrl" size="24" />
    {{ safe.safeName }}
    <a
      v-if="safe.safeAddress"
      :href="safeLink"
      class="ml-2 flex font-normal text-skin-text"
      target="_blank"
    >
      {{ shorten(safe.safeAddress) }}
      <i-ho-external-link class="ml-1" />
    </a>
  </span>
</template>
