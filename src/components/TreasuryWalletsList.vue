<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  wallets: TreasuryWallet[];
}>();
</script>

<template>
  <div class="mb-3 flex px-4 md:px-0">
    <h2>{{ $t('treasury.title') }}</h2>
  </div>
  <BaseBlock
    :title="$t('treasury.wallets.title')"
    :counter="wallets.length"
    :label="$t('treasury.24hChange')"
    slim
  >
    <ul>
      <TreasuryWalletsListItem
        v-for="wallet in wallets"
        :key="wallet.address"
        :wallet="wallet"
      />
    </ul>
  </BaseBlock>
</template>
