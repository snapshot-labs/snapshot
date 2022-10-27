<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import { FundsAsset } from '@/helpers/safe';

defineProps<{
  asset: FundsAsset;
}>();
</script>

<template>
  <div class="flex items-center py-1">
    <img
      :src="`https://cdn.stamp.fyi/token/${
        asset.tokenAddress || '0x0000000000000000000000000000000000000000'
      }`"
      :alt="asset.logoUri"
      class="mr-2 w-5 rounded-full"
    />
    <div class="flex grow items-center justify-between leading-5">
      <div class="text-left">
        <div class="text-skin-link">{{ asset.name }}</div>
        <div>{{ asset.symbol }}</div>
      </div>
      <div class="text-right">
        <div>Balance:</div>
        <div class="text-skin-link">
          {{
            Number(formatUnits(asset.safeBalance, asset.decimals)).toFixed(3)
          }}
        </div>
      </div>
    </div>
  </div>
</template>
