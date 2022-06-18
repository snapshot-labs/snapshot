<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { TreasuryWallet } from '@/helpers/interfaces';

const props = defineProps<{
  space: { id: string; treasuries: TreasuryWallet[]; admins: string[] };
}>();

const route = useRoute();

const wallet = computed(() =>
  props.space.treasuries.find(w => w.address === route.params.wallet)
);
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <TreasuryAssetsList v-if="wallet" :wallet="wallet" />
      <TreasuryWalletsList
        v-else
        :wallets="space.treasuries"
        :admins="space.admins"
      />
    </template>
  </TheLayout>
</template>
