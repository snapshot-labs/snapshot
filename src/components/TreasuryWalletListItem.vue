<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';

defineProps<{
  item: {
    contract_ticker_symbol: string;
    logo_url: string;
    contract_decimals: number;
    balance: string;
    quote: number;
  };
}>();

const { formatCompactNumber } = useIntl();
</script>

<template>
  <div class="px-4 py-3 border-b last:border-0 flex items-center gap-3">
    <img :src="item.logo_url" class="w-6 h-6" />
    <div class="leading-6">
      <div class="text-md text-skin-link font-semibold">
        {{
          formatCompactNumber(
            Number(formatUnits(item.balance, item.contract_decimals))
          )
        }}
        {{ item.contract_ticker_symbol }}
      </div>
      <div>${{ formatCompactNumber(item.quote) }}</div>
    </div>
  </div>
</template>
