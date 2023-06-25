<script setup lang="ts">
withDefaults(
  defineProps<{
    spaceCollectionInfo: any;
    collectionInfo: any;
    currency: string;
    loading?: boolean;
    showPrice?: boolean;
  }>(),
  { loading: false, showPrice: false }
);
</script>

<template>
  <BaseButton
    primary
    :loading="loading"
    :disabled="!spaceCollectionInfo.enabled"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <template
        v-if="spaceCollectionInfo.maxSupply === collectionInfo.mintCount"
      >
        Sold out
      </template>
      <template v-else>
        MINT
        <template v-if="showPrice">
          for {{ spaceCollectionInfo.formattedMintPrice }} {{ currency }}
        </template></template
      >
    </template>
  </BaseButton>
</template>
