<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close', 'mint']);

const { mintCurrency, spaceCollectionsInfo, minting, init, inited } =
  useNFTClaimer(props.space, props.proposal);

const nfts = ref([]);

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});

watch(
  () => props.open,
  val => {
    if (val) init();
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
              <span class="text-xl font-bold text-skin-link">
                {{ spaceCollectionInfo.maxSupply }}
              </span>
              <span>Max supply</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-skin-link">
                {{ spaceCollectionInfo.mintPrice }} {{ mintCurrency }}
              </span>
              <span>Mint price</span>
            </div>
            <BaseButton
              primary
              :loading="minting"
              :disabled="!spaceCollectionInfo.enabled"
              @click="$emit('mint')"
            >
              MINT
            </BaseButton>
          </div>

          <SpaceProposalNFTProgress
            :max-supply="spaceCollectionInfo.maxSupply"
            :supply="spaceCollectionInfo.proposals[proposal.id].mints.length"
            :show-info="false"
          />
        </div>

        <div
          v-for="n in 100"
          :key="n"
          class="mt-3 flex w-full flex-row content-center items-center justify-between px-4"
        >
          <div class="flex flex-row gap-x-4">
            <div class="h-[52px] w-[52px] rounded bg-skin-border"></div>
            <div class="flex flex-col">
              <span>#{{ n }}</span>
              <span>0x000000</span>
            </div>
          </div>
          <a href="https://snapshot.org" target="_blank">
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
