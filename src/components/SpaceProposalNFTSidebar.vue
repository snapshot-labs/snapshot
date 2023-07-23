<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { formatMintPrice } from '@/helpers/nftClaimer';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

useNFTClaimer(props.space, props.proposal);
const { getContractInfo, getCollectionInfo } = useNFTClaimerStorage();
const { web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
// TODO enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = ref(true);

const isModalMintOpen = ref(false);
const isModalExploreOpen = ref(false);
const shouldReopenMintModal = ref(false);

function reopenMintModal() {
  if (shouldReopenMintModal.value) {
    isModalMintOpen.value = true;
    shouldReopenMintModal.value = false;
  }
}

watch(
  () => web3Account.value,
  () => reopenMintModal()
);

const contractInfo = computed(() => {
  return getContractInfo(props.space.id);
});

const collectionInfo = computed(() => {
  return getCollectionInfo(props.space.id, props.proposal.id);
});
</script>

<template>
  <template v-if="collectionInfo">
    <BaseBlock v-if="contractInfo" :title="$t('SnapIt!')" :slim="true">
      <div class="flex flex-col space-y-4 p-4">
        <div class="group flex flex-row gap-4">
          <NFTClaimerLogo class="shrink-0" />
          <span class="text-sm leading-tight">
            Mint your NFT now to show your support for this proposal.
            <BaseLink link="https://docs.snapshot.org">Learn more</BaseLink>
          </span>
        </div>

        <SpaceProposalNFTProgress
          :max-supply="collectionInfo.maxSupply"
          :supply="collectionInfo.mintCount"
          show-info
          class="cursor-pointer"
          tabindex="0"
          title="View list of minted NFTs"
          @click="isModalExploreOpen = true"
        >
          <template #secondary>
            <i-ho-arrow-top-right-on-square class="ml-2 mt-2 text-xs" />
          </template>
        </SpaceProposalNFTProgress>
      </div>
      <div
        class="flex flex-row content-center items-center justify-between border-t px-4 py-3"
      >
        <div class="flex flex-col">
          <span>Mint price</span>
          <span class="text-base font-bold text-skin-link">
            {{ formatMintPrice(collectionInfo.mintPrice) }}
          </span>
        </div>
        <NFTClaimerMintButton
          :contract-info="contractInfo"
          :collection-info="collectionInfo"
          @click="isModalMintOpen = true"
        />
      </div>

      <teleport to="#modal">
        <SpaceProposalNFTMintModal
          :open="isModalMintOpen"
          :space="space"
          :proposal="proposal"
          @close="isModalMintOpen = false"
          @switchConnectAccount="
            (shouldReopenMintModal = true),
              (isModalMintOpen = false),
              (modalAccountOpen = true)
          "
        />
        <SpaceProposalNFTExploreModal
          :open="isModalExploreOpen"
          :space="space"
          :proposal="proposal"
          @close="isModalExploreOpen = false"
          @mint="(isModalExploreOpen = false), (isModalMintOpen = true)"
        />
      </teleport>
    </BaseBlock>
  </template>
  <NFTClaimerSetupBaseBlock
    v-else-if="!contractInfo && isSpaceController"
    :space="space"
  />
</template>
