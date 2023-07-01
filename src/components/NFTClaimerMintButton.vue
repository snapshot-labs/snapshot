<script setup lang="ts">
defineProps<{
  spaceCollectionInfo: any;
  collectionInfo: any;
  currency: string;
  loading?: boolean;
  showPrice?: boolean;
}>();

const { formatNumber } = useIntl();
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
          for {{ formatNumber(spaceCollectionInfo.formattedMintPrice) }}
          {{ currency }}
        </template>
      </template>
    </template>
  </BaseButton>
</template>
