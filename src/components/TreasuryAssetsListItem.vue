<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';
import { TreasuryAsset } from '@/helpers/interfaces';

defineProps<{
  asset: TreasuryAsset;
}>();

const { formatCompactNumber, formatNumber } = useIntl();
</script>

<template>
  <div
    class="px-4 py-3 !border-b border-skin-border last:border-0 flex items-center gap-3"
  >
    <img alt="Asset logo" :src="asset.logo_url" class="w-6 h-6" />
    <div class="flex w-full justify-between">
      <div class="leading-6">
        <div class="text-md text-skin-heading font-semibold">
          {{ asset.contract_name }}
        </div>
        <div>
          <span class="mr-1">
            {{
              formatCompactNumber(
                Number(formatUnits(asset.balance, asset.contract_decimals))
              )
            }}
          </span>
          <span>
            {{ asset.contract_ticker_symbol }}
          </span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-md text-skin-heading">
          ${{ formatNumber(asset.quote) }}
        </div>
        <IndicatorAssetsChange
          :quote="{ quote: asset.quote, quote_24h: asset.quote_24h }"
        />
      </div>
    </div>
  </div>
</template>
