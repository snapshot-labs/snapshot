<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  wallets: TreasuryWallet[];
}>();
</script>

<template>
  <BaseBlock
    :title="$t('treasury.wallets')"
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
