<script setup lang="ts">
const props = defineProps<{
  contractInfo: any;
  collectionInfo: any;
  currency: string;
  loading?: boolean;
  showPrice?: boolean;
}>();

const { formatNumber } = useIntl();

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
          for {{ formatNumber(collectionInfo.formattedMintPrice) }}
          {{ currency }}
        </template>
      </template>
    </template>
  </BaseButton>
</template>
