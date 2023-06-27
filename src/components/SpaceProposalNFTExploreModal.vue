<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close', 'mint']);

const { mintCurrency, spaceCollectionsInfo, init, profiles } = useNFTClaimer(
  props.space,
  props.proposal
);

const { formatRelativeTime } = useIntl();

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});

const collectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id].proposals[
    props.proposal.id
  ];
});

const nfts = computed(() => {
  return spaceCollectionsInfo.value[props.space.id].proposals[props.proposal.id]
    .mints;
});

watch(
  () => props.open,
  () => {
    props.open && init();
  }
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4 pb-2"
      >
        <h3>View all NFTs</h3>
      </div>
    </template>

    <template #default="{ maxHeight }">
      <div class="flex flex-col" :style="{ minHeight: maxHeight }">
        <div
          class="sticky top-0 flex flex-col gap-y-4 border-b border-t bg-skin-bg p-4"
        >
          <div
            class="flex w-full flex-row content-center items-center justify-between"
          >
            <div class="flex flex-col">
              <span class="text-lg font-bold leading-none text-skin-link">
                {{ spaceCollectionInfo.maxSupply }}
              </span>
              <span class="leading-tight">Max supply</span>
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-bold leading-none text-skin-link">
                {{ spaceCollectionInfo.formattedMintPrice }} {{ mintCurrency }}
              </span>
              <span class="leading-tight">Mint price</span>
            </div>
            <NFTClaimerMintButton
              :space-collection-info="spaceCollectionInfo"
              :collection-info="collectionInfo"
              :currency="mintCurrency"
              @click="$emit('mint')"
            />
          </div>

          <SpaceProposalNFTProgress
            :max-supply="spaceCollectionInfo.maxSupply"
            :supply="collectionInfo.mintCount"
            :show-info="false"
          />
        </div>

        <div
          v-for="nft in nfts"
          :key="nft.id"
          class="mt-3 flex w-full flex-row content-center items-center justify-between px-4"
        >
          <div class="flex flex-row gap-x-4">
            <NFTClaimerLogo class="-top-1" />
            <div class="flex flex-col">
              <BaseUser
                :address="nft.minterAddress"
                :profile="profiles[nft.minterAddress]"
                :space="space"
                :proposal="proposal"
              />
              <span>{{ formatRelativeTime(nft.timestamp) }}</span>
            </div>
          </div>
          <a
            :href="`https://goerli.etherscan.io/tx/${nft.txHash}`"
            target="_blank"
          >
            <i-ho-arrow-top-right-on-square class="ml-2" />
          </a>
        </div>

        <div v-if="nfts.length === 0" class="flex flex-row justify-center p-4">
          <span>No NFTs found...</span>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
