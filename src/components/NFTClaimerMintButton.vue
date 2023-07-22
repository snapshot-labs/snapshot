<script setup lang="ts">
import { formatMintPrice } from '@/helpers/nftClaimer';

const props = defineProps<{
  contractInfo: any;
  collectionInfo: any;
  loading?: boolean;
  showPrice?: boolean;
}>();

const soldOut = computed(() => {
  return props.collectionInfo.maxSupply === props.collectionInfo.mintCount;
});
</script>

<template>
  <BaseButton
    primary
    :loading="loading"
    :disabled="!contractInfo.enabled || soldOut"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <template v-if="soldOut"> Sold out </template>
      <template v-else>
        MINT
        <template v-if="showPrice">
          for {{ formatMintPrice(collectionInfo.mintPrice) }}
        </template>
      </template>
    </template>
  </BaseButton>
</template>
