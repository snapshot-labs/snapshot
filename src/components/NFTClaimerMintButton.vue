<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';

withDefaults(
  defineProps<{
    spaceCollectionInfo: any;
    collectionInfo: any;
    currency: string;
    count?: number;
    loading?: boolean;
    showPrice?: boolean;
  }>(),
  { loading: false, showPrice: false, count: 1 }
);
</script>

<template>
  <BaseButton
    primary
    :loading="loading"
    :disabled="!spaceCollectionInfo.enabled"
  >
    <template v-if="spaceCollectionInfo.maxSupply === collectionInfo.mintCount">
      Sold out
    </template>
    <template v-else>
      MINT
      <template v-if="showPrice">
        {{ count }} for
        {{ formatUnits(BigInt(spaceCollectionInfo.mintPrice * count), 18) }}
        {{ currency }}
      </template></template
    >
  </BaseButton>
</template>
