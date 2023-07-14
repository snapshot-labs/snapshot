<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { shorten } from '@/helpers/utils';

defineProps<{
  mint: any;
}>();
</script>

<template>
  <router-link
    :to="{
      name: 'spaceProposal',
      params: {
        key: mint.proposal.spaceCollection.spaceId,
        id: BigNumber.from(mint.proposal.id).toHexString()
      }
    }"
  >
    <NFTClaimerLogo class="mx-auto" />
    <div class="mt-2 truncate text-xs">
      {{ shorten(mint.proposal.id) }}
    </div>
  </router-link>
</template>
