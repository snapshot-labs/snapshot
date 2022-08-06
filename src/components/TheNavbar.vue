<script setup lang="ts">
import { useApp, useWeb3, useTxStatus } from '@/composables';

const { pendingCount } = useTxStatus();
const { env, showSidebar, domain } = useApp();
const { web3Account } = useWeb3();
</script>

<template>
  <div
    v-if="env === 'demo'"
    class="bg-primary p-3 text-center"
    style="color: white; font-size: 20px"
  >
    {{ $t('demoSite') }}
  </div>
  <div>
    <BaseContainer class="pl-0 pr-3 sm:!px-4">
      <div class="flex items-center py-[12px]">
        <div class="ml-3 flex flex-auto items-center">
          <ButtonSidebar class="sm:hidden" @click="showSidebar = !showSidebar">
            <i-ho-dots-vertical class="text-skin-link" />
          </ButtonSidebar>
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
    v-if="pendingCount > 0"
    class="flex justify-center bg-primary py-2 text-center text-white"
  >
    <LoadingSpinner fill-white class="mr-2" />
    {{ $tc('delegate.pendingTransaction', pendingCount) }}
  </div>
</template>
