<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTreasury } from '@/composables/useTreasury';

const props = defineProps<{
  space: { id: string };
}>();
const { getFilteredTokenBalances } = useTreasury();

const loading = ref(false);
const assets = ref<null | any[]>(null);

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
      <BaseBlock v-else slim>
        <TreasuryWalletListItem
          v-for="(asset, i) in assets"
          :key="i"
          :item="asset"
        />
      </BaseBlock>
    </template>
  </TheLayout>
</template>
