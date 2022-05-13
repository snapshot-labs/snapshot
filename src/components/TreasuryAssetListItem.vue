<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';
import { AssetInfo } from '@/helpers/interfaces';

defineProps<{
  item: AssetInfo;
}>();

const { formatCompactNumber, formatNumber, formatPercentNumber } = useIntl();
</script>

<template>
  <div class="px-4 py-3 border-b last:border-0 flex items-center gap-3">
    <img alt="Asset logo" :src="item.logo_url" class="w-6 h-6" />
    <div class="flex w-full justify-between">
      <div class="leading-6">
        <div class="text-md text-skin-heading font-semibold">
          {{ item.contract_name }}
        </div>
        <div>
          <span class="mr-1">
            {{
              formatCompactNumber(
                Number(formatUnits(item.balance, item.contract_decimals))
              )
            }}
          </span>
          <span>
            {{ item.contract_ticker_symbol }}
          </span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-md text-skin-heading">
          ${{ formatNumber(item.quote) }}
        </div>
        <span
          id="quote-change"
          :class="[item.quote_24h > item.quote ? 'text-red' : 'text-green']"
        >
          {{
            `${item.quote_24h > item.quote ? '' : '+'}${formatPercentNumber(
              (item.quote - item.quote_24h) / item.quote_24h
            )}`
          }}
        </span>
      </div>
    </div>
  </div>
</template>
