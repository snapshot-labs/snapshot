<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTreasury } from '@/composables/useTreasury';
import { TreasuryAsset } from '@/helpers/interfaces';

const props = defineProps<{
  space: { id: string };
}>();
const { getFilteredTokenBalances } = useTreasury();

const loading = ref(false);
const assets = ref<null | TreasuryAsset[]>(null);
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
  assets.value = await getFilteredTokenBalances(props.space.id);
  loading.value = false;
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <LoadingRow v-if="loading" block />
      <TreasuryWalletsList v-if="wallets" :wallets="wallets" />
      <TreasuryAssetsList v-if="assets" :assets="assets" />
    </template>
  </TheLayout>
</template>
