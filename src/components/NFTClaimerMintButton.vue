<script setup lang="ts">
withDefaults(
  defineProps<{
    spaceCollectionInfo: any;
    collectionInfo: any;
    loading?: boolean;
    showPrice?: boolean;
    currency?: string;
  }>(),
  { loading: false, showPrice: false, currency: 'WETH' }
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
        for {{ spaceCollectionInfo.formattedMintPrice }} {{ currency }}
      </template></template
    >
  </BaseButton>
</template>
