<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';
import { useTreasury } from '@/composables/useTreasury';

const props = defineProps<{
  space: { id: string };
}>();

const { formatCompactNumber } = useIntl();
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
      <LoadingRow v-if="loading" />
      <BaseBlock slim>
        <div
          v-for="(asset, i) in assets"
          :key="i"
          class="px-4 py-3 border-b last:border-0 flex"
        >
          <div class="flex-auto">
            <div class="leading-[24px]">
              <div class="text-md text-skin-link">
                {{
                  formatCompactNumber(
                    formatUnits(
                      asset.balance || 0,
                      asset.contract_decimals || 0
                    )
                  )
                }}
                {{ asset.contract_ticker_symbol }}
              </div>
              <div>${{ formatCompactNumber(asset.quote) }}</div>
            </div>
          </div>
          <i-ho-chevron-right class="mt-2" />
        </div>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
