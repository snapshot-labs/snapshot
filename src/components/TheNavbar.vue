<script setup lang="ts">
import { explorerUrl, shorten } from '@/helpers/utils';

const { pendingTransactions } = useTxStatus();
const { env, showSidebar, domain } = useApp();
const { web3Account } = useWeb3();
const showDemoBanner = ref(true);

const pendingTransactionsWithLinks = computed(() =>
  pendingTransactions.value.filter(tx => tx.txId)
);
</script>

<template>
  <div
    v-if="env === 'demo' && showDemoBanner"
    class="relative bg-primary p-3 text-center"
    style="color: white; font-size: 20px"
  >
    {{ $t('demoSite') }}
    <BaseButtonIcon
      class="absolute right-3 top-[10px]"
      @click="showDemoBanner = false"
    >
      <i-ho-x />
    </BaseButtonIcon>
  </div>
  <div>
    <BaseContainer class="pl-0 pr-3 sm:!px-4">
      <div class="flex items-center py-[12px]">
        <div class="ml-3 flex flex-auto items-center">
          <BaseButtonRound
            class="sm:hidden"
            @click="showSidebar = !showSidebar"
          >
            <i-ho-dots-vertical class="text-skin-link" />
          </BaseButtonRound>
          <router-link
            :to="{ path: '/' }"
            class="-ml-3 hidden items-center sm:block"
            style="font-size: 24px"
          >
            snapshot
          </router-link>
        </div>
        <div :key="web3Account" class="flex space-x-2">
          <NavbarAccount />

          <NavbarNotifications v-if="web3Account && !domain" />

          <NavbarExtras />
        </div>
      </div>
    </BaseContainer>
  </div>
  <div
    v-if="pendingTransactions.length > 0"
    class="flex justify-center bg-primary py-2 text-center text-white"
  >
    <LoadingSpinner fill-white class="mr-2" />
    {{ pendingTransactions.length }}
    {{ $t('setup.pendingTransactions') }}
    <BaseLink
      v-for="tx in pendingTransactionsWithLinks"
      :key="tx.id"
      :link="explorerUrl(tx.network, tx.txId, 'tx')"
      class="ml-2 !text-skin-text hover:!text-skin-link"
      @click.stop
    >
      {{ shorten(tx.txId) }}
    </BaseLink>
  </div>
</template>
