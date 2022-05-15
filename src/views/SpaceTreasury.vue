<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTreasury } from '@/composables/useTreasury';
import { useRoute } from 'vue-router';

defineProps<{
  space: { id: string };
}>();

const { loadFilteredTokenBalances, treasuryAssets } = useTreasury();
const route = useRoute();

const loading = ref(false);
const wallets = [
  {
    address: '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f',
    name: 'Balancer',
    network: 1,
    ensAddress: 'balancer.eth'
  },
  {
    address: '0x57a8865cfb1ecef7253c27da6b4bc3daee5be518',
    name: 'Gitcoin',
    network: 1,
    ensAddress: 'gitcoindao.eth'
  }
];

onMounted(async () => {
  loading.value = true;
  await loadFilteredTokenBalances(wallets.map(w => w.address));
  loading.value = false;
});

const walletAssets = computed(() => {
  if (treasuryAssets.value?.[route.params.wallet as string]) {
    return treasuryAssets.value[route.params.wallet as string];
  }
  return [];
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <LoadingRow v-if="loading" block />
      <TreasuryAssetsList
        v-else-if="walletAssets.length"
        :assets="walletAssets"
      />
      <TreasuryWalletsList v-else :wallets="wallets" />
    </template>
  </TheLayout>
</template>
