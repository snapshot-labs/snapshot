<script setup lang="ts">
import { useRoute } from 'vue-router';

defineProps<{
  space: { id: string };
}>();

const route = useRoute();

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
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <TreasuryAssetsList v-if="route.params.wallet" />
      <TreasuryWalletsList v-else :wallets="wallets" />
    </template>
  </TheLayout>
</template>
