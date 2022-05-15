<script setup lang="ts">
import { useTreasury } from '@/composables/useTreasury';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { loadFilteredTokenBalances, treasuryAssets, loadingBalances } =
  useTreasury();

const walletAssets = computed(
  () => treasuryAssets.value?.[route.params.wallet as string] ?? []
);

onMounted(() => loadFilteredTokenBalances(route.params.wallet as string));
</script>

<template>
  <BaseBlock
    :title="$t('treasury.assets')"
    :counter="walletAssets?.length"
    :label="$t('treasury.24hChange')"
    :loading="loadingBalances"
    slim
  >
    <ul>
      <TreasuryAssetsListItem
        v-for="asset in walletAssets"
        :key="asset.contract_address"
        :asset="asset"
      />
    </ul>
  </BaseBlock>
</template>
