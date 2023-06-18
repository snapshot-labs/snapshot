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
    <div class="flex justify-center">
      <div
        class="flex justify-center rounded-full !border-[1px] !border-skin-text p-[2px]"
      >
        <div class="h-[52px] w-[52px] rounded-full bg-skin-border"></div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="truncate text-xs">
        {{ nft.proposal.spaceCollection.spaceId }}
      </div>
    </div>
  </router-link>
</template>
