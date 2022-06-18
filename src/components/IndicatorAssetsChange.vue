<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';

defineProps<{
  quote: {
    quote: number;
    quote_24h: number;
  };
}>();

const { formatPercentNumber, formatNumber } = useIntl();
</script>

<template>
  <div v-if="quote.quote_24h || quote.quote">
    <span
      data-testid="asset-quote-change"
      :class="[quote.quote_24h > quote.quote ? 'text-red' : 'text-green']"
    >
      <span class="pr-1" data-testid="asset-quote-change-percent">
        {{
          `${quote.quote_24h > quote.quote ? '' : '+'}${formatPercentNumber(
            (quote.quote - quote.quote_24h) / quote.quote_24h
          )}`
        }}
      </span>
      <span data-testid="asset-quote-change-usd">
        {{ `($${formatNumber(quote.quote - quote.quote_24h)})` }}
      </span>
    </span>
  </div>
</template>
