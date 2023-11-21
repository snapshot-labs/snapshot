<script setup lang="ts">
import { getIpfsUrl, shorten } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { GnosisSafe } from '../types';
import { getSafeAppLink } from '../utils';
import ExternalLink from './ExternalLink.vue';

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
  <ExternalLink v-if="safe.safeAddress" :link="safeLink">
    <BaseAvatar :src="networkLogoUrl" size="24" />
    {{ safe.safeName }}

    <span class="font-normal">
      {{ shorten(safe.safeAddress) }}
    </span>
  </ExternalLink>
</template>
