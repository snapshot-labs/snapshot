<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

const { mintNetwork, mintCurrency, minting, mint, init, spaceCollectionsInfo } =
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
        <!-- TODO nft preview block -->
        <BaseBlock>
          <div class="flex flex-row justify-between py-2">
            <span>Contract</span>
            <a
              class="flex flex-row"
              :href="explorerUrl(mintNetwork, spaceCollectionInfo.id)"
              target="_blank"
            >
              <span>{{ shorten(spaceCollectionInfo.id) }}</span>
              <i-ho-arrow-top-right-on-square class="ml-2" />
            </a>
          </div>
          <div class="flex flex-row justify-between py-2">
            <span>Proposal author's share</span>
            <span>0%</span>
          </div>
          <div class="flex flex-row justify-between py-2">
            <span>Max supply</span>
            <span>{{ spaceCollectionInfo.maxSupply }}</span>
          </div>
          <div class="flex flex-row justify-between py-2">
            <span>Remaining supply</span>
            <span>{{
              spaceCollectionInfo.maxSupply -
              spaceCollectionInfo.proposals[proposal.id].mintCount
            }}</span>
          </div>
          <div class="flex flex-row justify-between py-2">
            <span>Mint price</span>
            <div class="flex flex-col">
              <span class="text-lg font-bold text-skin-link">
                {{ spaceCollectionInfo.mintPrice }}
                {{ mintCurrency }}
              </span>
              <!-- <span>~2000 USD</span> -->
            </div>
          </div>
        </BaseBlock>
        <BaseButton primary :loading="minting" @click="mint()">
          MINT for {{ spaceCollectionInfo.mintPrice }}
          {{ mintCurrency }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
