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
  () => {
    init();
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
  <BaseBlock
    v-if="inited && spaceCollectionInfo"
    :title="$t('NFT Claimer')"
    :slim="true"
  >
    <div class="flex flex-col space-y-4 p-4">
      <div class="group flex flex-row gap-3">
        <div
          class="flex flex-row items-center justify-center rounded border border-skin-link bg-skin-border p-2"
        >
          <BaseIcon
            name="snapshot"
            size="36"
            class="text-primary group-hover:text-snapshot"
          />
        </div>
        <span class="text-sm leading-tight">
          Mint your NFT now to show your support for this proposal.
          <a href="https://docs.snapshot.org/">Learn more</a>
        </span>
      </div>

      <SpaceProposalNFTProgress
        :max-supply="spaceCollectionInfo.maxSupply"
        :supply="spaceCollectionInfo.proposals[proposal.id].mintCount"
        class="cursor-pointer"
        @click="isModalExploreOpen = true"
      />
    </div>
    <div
      class="flex w-full flex-row content-center items-center justify-between border-t px-4 py-3"
    >
      <div class="flex flex-col">
        <span>Mint price</span>
        <span class="text-base font-bold text-skin-link"
          >{{ spaceCollectionInfo.formattedMintPrice }} WETH</span
        >
      </div>
      <BaseButton
        primary
        :loading="minting"
        :disabled="!spaceCollectionInfo.enabled"
        @click="isModalMintOpen = true"
      >
        MINT
      </BaseButton>
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
