<script setup lang="ts">
import { TreasuryAsset } from '@/helpers/interfaces';

defineProps<{
  assets: TreasuryAsset[];
}>();
</script>

<template>
  <BaseBlock
    :title="$t('treasury.assets')"
    :counter="assets.length"
    :label="$t('treasury.24hChange')"
    slim
  >
    <ul>
      <li v-for="asset in assets" :key="asset.contract_address">
        <TreasuryAssetsListItem :asset="asset" />
      </li>
    </ul>
  </BaseBlock>
</template>
