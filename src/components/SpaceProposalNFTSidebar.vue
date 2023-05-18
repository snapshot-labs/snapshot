<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const {
  mintCurrency,
  mintPrice,
  mintCount,
  mintCountTotal,
  minting,
  mint,
  enableNFTClaimer,
  inited
} = useNFTClaimer(props.space, props.proposal);

const isModalMinterOpen = ref(false);
const isModalExploreOpen = ref(false);

async function mintLocal() {
  // TODO check space.nftClaimer enabled
  // if (!props.space?.nftClaimer)
  //   return enableNFTClaimer()
  mint();
}
</script>

<template>
  <BaseBlock v-if="inited" :title="$t('NFT Claimer')">
    <template #button>
      <BaseButton variant="flat" @click="isModalExploreOpen = true">
        Explore all
      </BaseButton>
    </template>
    <div class="flex flex-col items-center space-y-2">
      <div
        class="group flex h-[186px] w-[186px] flex-row items-center justify-center rounded-xl border border-skin-link bg-skin-border"
      >
        <BaseIcon
          name="snapshot"
          size="50"
          class="text-primary group-hover:text-snapshot"
        />
      </div>
      <span class="text-center text-skin-link">{{ proposal.title }}</span>
      <BaseButton primary :loading="minting" @click="mintLocal()">
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
