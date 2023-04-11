<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

const props = defineProps<{
  wallet: TreasuryWallet;
}>();

const { loadFilteredTokenBalances, treasuryAssets, loadingBalances } =
  useTreasury();

const walletAssets = computed(
  () => treasuryAssets.value?.[props.wallet.address] ?? []
);

const router = useRouter();

onMounted(() =>
  loadFilteredTokenBalances(props.wallet.address, props.wallet.network)
);
</script>

<template>
  <div class="mb-3 px-4 md:px-0">
    <ButtonBack @click="router.push({ name: 'spaceTreasury' })" />

    <h3>{{ wallet.name }}</h3>
  </div>
  <BaseBlock
    :title="$t('treasury.assets.title')"
    :counter="walletAssets?.length"
    :label="$t('treasury.24hChange')"
    :loading="loadingBalances"
    slim
  >
    <ul v-if="walletAssets.length">
      <TreasuryAssetsListItem
        v-for="asset in walletAssets"
        :key="asset.contract_address"
        :asset="asset"
      />
    </ul>
    <div v-else>
      <p class="p-4 text-center">
        {{ $t('treasury.assets.empty') }}
      </p>
    </div>
  </BaseBlock>
</template>
