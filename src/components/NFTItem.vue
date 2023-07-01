<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { shorten } from '@/helpers/utils';

defineProps<{
  nft: any;
}>();
</script>

<template>
  <router-link
    :to="{
      name: 'spaceProposal',
      params: {
        key: nft.proposal.spaceCollection.spaceId,
        id: BigNumber.from(nft.proposal.id).toHexString()
      }
    }"
  >
    <NFTClaimerLogo class="mx-auto" />
    <div class="mt-2 truncate text-xs">
      {{ shorten(nft.proposal.id) }}
    </div>
  </router-link>
</template>
