<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';

const props = defineProps<{
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
    <NFTClaimerLogo />
    <div class="mt-2 flex items-center justify-center">
      <div class="truncate text-xs">
        {{ nft.proposal.spaceCollection.spaceId }}
      </div>
    </div>
  </router-link>
</template>
