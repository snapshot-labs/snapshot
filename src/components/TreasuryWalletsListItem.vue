<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { shorten, explorerUrl } from '@/helpers/utils';

defineProps<{
  wallet: TreasuryWallet;
}>();
</script>

<template>
  <div>
    <BaseLink
      :link="{
        name: 'spaceTreasury',
        params: { wallet: wallet.address }
      }"
    >
      <div
        class="px-4 py-3 !border-b border-skin-border last:border-0 flex items-center gap-3"
      >
        <BaseAvatar size="35" :address="wallet.address" />
        <div>
          <div data-testid="wallet-name" class="text-md text-skin-heading">
            {{ wallet.name }}
          </div>
          <div class="flex items-center text-sm text-skin-text space-x-[6px]">
            <span v-if="wallet.ensAddress" data-testid="wallet-ens-address">
              {{ wallet.ensAddress }}
            </span>
            <div class="h-1 w-1 bg-skin-text rounded-full" />
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
    </BaseLink>
  </div>
</template>
