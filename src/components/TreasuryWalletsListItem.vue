<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { TreasuryWallet } from '@/helpers/interfaces';
import { shorten, explorerUrl } from '@/helpers/utils';
import { useTreasury } from '@/composables/useTreasury';
import { useIntl } from '@/composables/useIntl';

const { formatNumber } = useIntl();

const props = defineProps<{
  wallet: TreasuryWallet;
  ensAddress?: string;
}>();

const { loadFilteredTokenBalances, treasuryAssets, loadingBalances } =
  useTreasury();

const walletQuote = computed(() => {
  const assets = treasuryAssets.value[props.wallet.address];
  if (!assets?.length)
    return {
      quote: 0,
      quote_24h: 0
    };
  const sumOfAssetsQuote = assets.reduce((sum, asset) => {
    return sum + asset.quote;
  }, 0);
  const sumOfAssetsQuote24h = assets.reduce((sum, asset) => {
    return sum + asset.quote_24h;
  }, 0);
  return {
    quote: sumOfAssetsQuote,
    quote_24h: sumOfAssetsQuote24h
  };
});

onMounted(() =>
  loadFilteredTokenBalances(props.wallet.address, props.wallet.network)
);
</script>

<template>
  <li class="border-b border-skin-border last:border-b-0">
    <BaseLink
      :link="{
        name: 'spaceTreasury',
        params: { wallet: wallet.address }
      }"
      class="flex justify-between px-4 py-[12px]"
    >
      <div class="flex items-center gap-2">
        <AvatarUser size="35" :address="wallet.address" />
        <div>
          <div
            data-testid="wallet-name"
            class="text-md font-semibold text-skin-heading"
          >
            {{ wallet.name }}
          </div>
          <div class="flex items-center space-x-[6px] text-sm text-skin-text">
            <span
              v-if="ensAddress"
              data-testid="wallet-ens-address"
              class="flex items-center"
            >
              {{ ensAddress }}
              <div class="ml-1 h-1 w-1 rounded-full bg-skin-text" />
            </span>
            <BaseLink
              :link="explorerUrl(wallet.network, wallet.address)"
              class="!text-skin-text hover:!text-skin-link"
              @click.stop
            >
              {{ shorten(wallet.address) }}
            </BaseLink>
          </div>
        </div>
      </div>
      <div
        v-if="loadingBalances"
        class="flex flex-col items-end space-y-[12px]"
      >
        <div class="lazy-loading h-3 w-[100px] rounded-md" />
        <div class="lazy-loading h-3 w-[120px] rounded-md" />
      </div>
      <div v-else-if="walletQuote" class="text-right">
        <span class="text-md"> ${{ formatNumber(walletQuote.quote) }} </span>
        <IndicatorAssetsChange :quote="walletQuote" />
      </div>
    </BaseLink>
  </li>
</template>
