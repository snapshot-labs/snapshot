<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

const { mintNetwork, mintCurrency, loading, mint, init, spaceCollectionsInfo } =
  useNFTClaimer(props.space, props.proposal);

watch(
  () => props.open,
  () => {
    init();
  }
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
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('Mint NFT') }}</h3>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col justify-between gap-y-4 p-4">
        <BaseBlock>
          <div class="flex flex-row justify-between py-1">
            <span>Contract</span>
            <a
              class="flex flex-row"
              :href="explorerUrl(mintNetwork, spaceCollectionInfo.address)"
              target="_blank"
            >
              <span>{{ shorten(spaceCollectionInfo.address) }}</span>
              <i-ho-arrow-top-right-on-square class="ml-2" />
            </a>
          </div>
          <div class="flex flex-row justify-between py-1">
            <span>Proposal author's share</span>
            <span>{{ spaceCollectionInfo.proposerFee }}%</span>
          </div>
          <div class="flex flex-row justify-between py-1">
            <span>Max supply</span>
            <span>{{ spaceCollectionInfo.maxSupply }}</span>
          </div>
          <div class="flex flex-row justify-between py-1">
            <span>Remaining supply</span>
            <span>{{
              spaceCollectionInfo.maxSupply - collectionInfo.mintCount
            }}</span>
          </div>
          <div class="flex flex-row justify-between py-1">
            <span>Mint price</span>
            <div class="flex flex-col">
              <span class="text-md font-bold text-skin-link">
                {{ spaceCollectionInfo.formattedMintPrice }}
                {{ mintCurrency }}
              </span>
              <span class="text-end">~xxx USD</span>
            </div>
          </div>
        </BaseBlock>
        <BaseButton primary :loading="loading" @click="mint()">
          MINT for {{ spaceCollectionInfo.formattedMintPrice }}
          {{ mintCurrency }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
