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
  <li
    class="flex items-center gap-2 border-b border-skin-border px-4 py-[12px] last:border-b-0"
  >
    <AvatarToken
      v-if="asset.logo_url"
      :src="asset.logo_url"
      :address="asset.contract_address"
      class="mr-1"
      size="38"
    />

    <div class="flex w-full justify-between">
      <div class="leading-6">
        <div
          data-testid="asset-name"
          class="text-md font-semibold text-skin-heading"
        >
          {{ asset.contract_name }}
        </div>
        <div>
          <span data-testid="asset-balance" class="mr-1">
            {{
              formatCompactNumber(
                Number(formatUnits(asset.balance, asset.contract_decimals))
              )
            }}
          </span>
          <span data-testid="asset-symbol">
            {{ asset.contract_ticker_symbol }}
          </span>
        </div>
      </div>
      <div class="text-right">
        <div data-testid="asset-quote" class="text-md text-skin-heading">
          ${{ formatNumber(asset.quote) }}
        </div>
        <IndicatorAssetsChange
          :quote="{ quote: asset.quote, quote_24h: asset.quote_24h }"
        />
      </div>
    </div>
  </li>
</template>
