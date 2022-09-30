<script setup lang="ts">
import { useApp, useWeb3, useTxStatus } from '@/composables';
import { useMediaQuery } from '@vueuse/core';

const { pendingCount } = useTxStatus();
const { env, showSidebar, domain } = useApp();
const { web3Account } = useWeb3();

const isXSmallScreen = useMediaQuery('(max-width: 768px)');
const titleStyle = isXSmallScreen
  ? { fontSize: '1.2rem' }
  : { fontSize: '1.5rem' };
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
          <!-- <router-link
            :to="{ path: '/' }"
            class="-ml-3 hidden items-center sm:block"
            style="font-size: 24px"
          >
            snapshot
          </router-link> -->
          <div class="d-flex flex-items-center flex-auto">
            <p
              class="d-inline-block d-flex flex-items-center"
              style="line-height: 20px"
              :style="titleStyle"
            >
              <a href="/"> IoTeX Governance Portal </a><br />
              <span style="color: gray; font-size: 1.125rem">
                powered by
                <a
                  href="https://snapshot.org/"
                  target="_blank"
                  style="color: gray"
                >
                  snapshot
                </a>
              </span>
            </p>
          </div>
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
