<script lang="ts" setup>
const loading = ref(false);
const nfts = ref([]);
const modalNFTsOpen = ref(false);
</script>

<template>
  <BaseBlock :title="'NFTs collected'" :counter="10" hide-bottom-border slim>
    <div v-if="loading || nfts.length" class="border-t px-4 py-4">
      <div v-if="loading" />

      <div v-else class="flex justify-between">
        <div class="flex w-full overflow-x-hidden">
          <div
            v-for="n in nfts"
            :key="n"
            class="mx-2 min-w-[66px] max-w-[66px] text-center first:ml-0"
          >
            <NFTItem :nft="n" />
          </div>
        </div>
        <!-- TODO more btn -->
        <span @click="modalNFTsOpen = true">more</span>
      </div>
    </div>
    <div v-else class="border-t p-4">
      {{ $t('noResultsFound') }}
    </div>
  </BaseBlock>

  <teleport to="#modal">
    <ModalProfileNFTs
      :nfts="nfts"
      :open="modalNFTsOpen"
      @close="modalNFTsOpen = false"
    />
  </teleport>
</template>
