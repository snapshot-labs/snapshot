<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { init, inited, spaceCollectionsInfo, mintCurrency } = useNFTClaimer(
  props.space,
  props.proposal
);
const { web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
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

onMounted(() => {
  init();
});

watch(
  () => web3Account.value,
  () => reopenMintModal()
);

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});

const collectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id].proposals[
    props.proposal.id
  ];
});
</script>

<template>
  <template v-if="inited">
    <BaseBlock v-if="spaceCollectionInfo" :title="$t('SnapIt!')" :slim="true">
      <div class="flex flex-col space-y-4 p-4">
        <div class="group flex flex-row gap-4">
          <NFTClaimerLogo class="shrink-0" />
          <span class="text-sm leading-tight">
            Mint your NFT now to show your support for this proposal.
            <a href="https://docs.snapshot.org/">Learn more</a>
          </span>
        </div>

        <SpaceProposalNFTProgress
          :max-supply="spaceCollectionInfo.maxSupply"
          :supply="collectionInfo.mintCount"
          class="cursor-pointer"
          tabindex="0"
          title="View list of minted NFTs"
          @click="isModalExploreOpen = true"
        />
      </div>
      <div
        class="flex w-full flex-row content-center items-center justify-between border-t px-4 py-3"
      >
        <div class="flex flex-col">
          <span>Mint price</span>
          <span class="text-base font-bold text-skin-link">
            {{ spaceCollectionInfo.formattedMintPrice }} {{ mintCurrency }}
          </span>
        </div>
        <NFTClaimerMintButton
          :space-collection-info="spaceCollectionInfo"
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
      v-else-if="!spaceCollectionInfo && isSpaceController"
      :title="$t('SnapIt!')"
    >
      <p class="mb-3">
        Setup SnapIt! now, and let your community mint NFT for each proposals.
        <a href="https://docs.snapshot.org">Learn more</a>
      </p>

      <router-link
        :to="{
          name: 'spaceSettings',
          params: { key: space.id }
        }"
      >
        <BaseButton :primary="true">Setup SnapIt!</BaseButton>
      </router-link>
    </BaseBlock>
  </template>
</template>
