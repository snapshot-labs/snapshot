<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { mintCurrency } = useNFTClaimer(props.space, props.proposal);
const { getContractInfo, getCollectionInfo } = useNFTClaimerStorage();
const { web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
const { formatNumber } = useIntl();
// TODO enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = true;

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
            <a href="https://docs.snapshot.org/">Learn more</a>
          </span>
        </div>

        <SpaceProposalNFTProgress
          :max-supply="collectionInfo.maxSupply"
          :supply="collectionInfo.mintCount"
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
            {{ formatNumber(collectionInfo.formattedMintPrice) }}
            {{ mintCurrency }}
          </span>
        </div>
        <NFTClaimerMintButton
          :contract-info="contractInfo"
          :collection-info="collectionInfo"
          :currency="mintCurrency"
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
    <BaseBlock
      v-else-if="!contractInfo && isSpaceController"
      :title="$t('SnapIt!')"
      class="text-center"
    >
      <div class="flex flex-col items-center gap-y-3">
        <NFTClaimerLogo size="lg" />
        <span class="text-skin-link">
          Setup SnapIt! now, and let your community mint NFT for each proposals.
          <a href="https://docs.snapshot.org">Learn more</a>
        </span>

        <router-link
          :to="{
            name: 'spaceSettings',
            params: { key: space.id },
            hash: '#NFTCLAIMER'
          }"
        >
          <BaseButton>Setup SnapIt!</BaseButton>
        </router-link>
      </div>
    </BaseBlock>
  </template>
</template>
