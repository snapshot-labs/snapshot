<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { web3Account } = useWeb3();
const { minting, init, inited, spaceCollectionsInfo } = useNFTClaimer(
  props.space,
  props.proposal
);

const isModalMintOpen = ref(false);
const isModalExploreOpen = ref(false);

watch(
  () => web3Account.value,
  to => {
    if (to) init();
  },
  {
    immediate: true
  }
);

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});
</script>

<template>
  {{ spaceCollectionInfo }}
  <BaseBlock v-if="inited && spaceCollectionInfo" :title="$t('NFT Claimer')">
    <div class="flex flex-col items-center space-y-4">
      <div class="group flex cursor-pointer flex-col items-center">
        <div
          class="flex h-[186px] w-[186px] flex-row items-center justify-center rounded-xl border border-skin-link bg-skin-border"
          @click="isModalExploreOpen = true"
        >
          <BaseIcon
            name="snapshot"
            size="50"
            class="text-primary group-hover:text-snapshot"
          />
        </div>
        <span class="mt-4 text-center text-skin-link">
          {{ proposal.title }}
        </span>
      </div>

      <SpaceProposalNFTProgress
        :max-supply="spaceCollectionInfo.maxSupply"
        :supply="spaceCollectionInfo.proposals[proposal.id].mintedCount"
        @click="isModalExploreOpen = true"
      />

      <BaseBlock class="w-full">
        <div
          class="flex w-full flex-row content-center items-center justify-between"
        >
          <div class="flex flex-col">
            <span>Mint price</span>
            <span class="text-lg font-bold text-skin-link"
              >{{ spaceCollectionInfo.mintPrice }} WETH</span
            >
          </div>
          <BaseButton
            primary
            :loading="minting"
            @click="isModalMintOpen = true"
          >
            MINT
          </BaseButton>
        </div>
      </BaseBlock>
    </div>
  </BaseBlock>

  <teleport to="#modal">
    <SpaceProposalNFTMintModal
      :open="isModalMintOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalMintOpen = false"
    />
    <SpaceProposalNFTExploreModal
      :open="isModalExploreOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalExploreOpen = false"
      @mint="(isModalExploreOpen = false), (isModalMintOpen = true)"
    />
  </teleport>
</template>
