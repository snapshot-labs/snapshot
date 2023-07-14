<script lang="ts" setup>
import { getUserNfts } from '@/helpers/nftClaimer';
import { useMediaQuery } from '@vueuse/core';

const props = defineProps<{
  address: string;
}>();

const loading = ref(false);
const nfts = ref<any[]>([]);
const modalNFTsOpen = ref(false);

const isXSmallScreen = useMediaQuery('(max-width: 420px)');
const isSmallScreen = useMediaQuery('(max-width: 544px)');
const isMediumScreen = useMediaQuery('(max-width: 768px)');

const numberOfSpacesByScreenSize = computed(() => {
  if (isXSmallScreen.value) {
    return 3;
  }
  if (isSmallScreen.value) {
    return 4;
  }
  if (isMediumScreen.value) {
    return 5;
  }
  return 7;
});

onMounted(async () => {
  nfts.value = await getUserNfts(props.address);
});
</script>

<template>
  <BaseBlock
    :title="'NFTs collected'"
    :counter="nfts.length"
    hide-bottom-border
    slim
  >
    <div v-if="loading || nfts.length" class="border-t px-4 py-4">
      <div v-if="loading" />

      <div v-else class="flex justify-between">
        <div class="flex w-full overflow-x-hidden">
          <div
            v-for="n in nfts.slice(0, numberOfSpacesByScreenSize + 1)"
            :key="n"
            class="mx-2 min-w-[66px] max-w-[66px] text-center first:ml-0"
          >
            <ProfileAboutNFTItem :mint="n" />
          </div>
        </div>
        <BlockSpacesListButtonMore
          v-if="numberOfSpacesByScreenSize < nfts.length"
          @click="modalNFTsOpen = true"
        />
      </div>
    </div>
    <div v-else class="border-t p-4">
      {{ $t('noResultsFound') }}
    </div>
  </BaseBlock>

  <teleport to="#modal">
    <ProfileAboutNFTExploreModal
      :nfts="nfts"
      :open="modalNFTsOpen"
      @close="modalNFTsOpen = false"
    />
  </teleport>
</template>
