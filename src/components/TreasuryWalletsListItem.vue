<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { shorten, explorerUrl } from '@/helpers/utils';

defineProps<{
  wallet: TreasuryWallet;
}>();
</script>

<template>
  <div>
    <BaseAvatar :address="wallet.address"></BaseAvatar>
    <div>
      <div data-testid="wallet-name">
        {{ wallet.name }}
      </div>
      <div>
        <span v-if="wallet.ensAddress" data-testid="wallet-ens-address"
          >{{ wallet.ensAddress }}
        </span>
        <BaseLink :link="explorerUrl(wallet.network, wallet.address)">
          {{ shorten(wallet.address) }}
        </BaseLink>
      </div>
    </div>
  </div>
</template>
