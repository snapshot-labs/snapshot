<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { mintCurrency, mintPrice, mintCount, mintCountTotal, minting, mint } =
  useNFTClaimer(props.space, props.proposal);

const isModalMinterOpen = ref(false);
const isModalExploreOpen = ref(false);
</script>

<template>
  <BaseBlock :title="$t('NFT Claimer')">
    <template #button>
      <BaseButton variant="flat" @click="isModalExploreOpen = true">
        Explore all
      </BaseButton>
    </template>
    <div class="flex flex-col items-center space-y-2">
      <div
        class="flex h-[186px] w-[186px] flex-row items-center justify-center rounded-xl border border-skin-link bg-skin-border"
      >
        <BaseIcon name="snapshot" size="50" class="text-primary" />
      </div>
      <span class="text-skin-link">{{ proposal.title }}</span>
      <BaseButton primary :loading="minting" @click="mint()">
        MINT for {{ mintPrice }} {{ mintCurrency }}
      </BaseButton>
      <span>{{ mintCount }} / {{ mintCountTotal }} minted</span>
    </div>
  </BaseBlock>

  <teleport to="#modal">
    <SpaceProposalNFTMinterModal
      :open="isModalMinterOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalMinterOpen = false"
    />
    <SpaceProposalNFTExploreModal
      :open="isModalExploreOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalExploreOpen = false"
    />
  </teleport>
</template>
