<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const isModalMinterOpen = ref(false);
const minMintPrice = ref('0.001');
const mintedCount = ref('23');
const mintedCountTotal = ref('500');
</script>

<template>
  <BaseBlock :title="$t('NFT Claimer')">
    <div class="flex flex-col items-center space-y-2">
      <div class="h-[186px] w-[186px] rounded-xl bg-primary"></div>
      <span class="text-skin-link">{{ proposal.title }}</span>
      <BaseButton primary @click="isModalMinterOpen = true">
        MINT for {{ minMintPrice }} ETH
      </BaseButton>
      <span>{{ mintedCount }} / {{ mintedCountTotal }} minted</span>
    </div>
  </BaseBlock>
  <teleport to="#modal">
    <SpaceProposalNFTMinterModal
      :open="isModalMinterOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalMinterOpen = false"
    />
  </teleport>
</template>
