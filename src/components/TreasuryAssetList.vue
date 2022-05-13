<script setup lang="ts">
import { TreasuryAsset } from '@/helpers/interfaces';

defineProps<{
  assets: TreasuryAsset[];
}>();
</script>

<template>
  <div>
    <ul>
      <li v-for="asset in assets" :key="asset.contract_address">
        <TreasuryAssetListItem :asset="asset" />
      </li>
    </ul>
  </div>
</template>
