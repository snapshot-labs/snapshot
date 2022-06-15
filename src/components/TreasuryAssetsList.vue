<script setup lang="ts">
import { useTreasury } from '@/composables/useTreasury';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  wallet: TreasuryWallet;
}>();

const route = useRoute();

const { loadFilteredTokenBalances, treasuryAssets, loadingBalances } =
  useTreasury();

const walletAssets = computed(
  () => treasuryAssets.value?.[route.params.wallet as string] ?? []
);

onMounted(() => loadFilteredTokenBalances(route.params.wallet as string));
</script>

<template>
  <div class="mb-3 px-4 md:px-0">
    <router-link :to="{ name: 'spaceTreasury' }">
      <ButtonBack />
    </router-link>

    <h3>{{ wallet.name }}</h3>
  </div>
  <BaseBlock
    :title="$t('treasury.assets.title')"
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
