<script setup>
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useModal } from '@/composables/useModal';
import { useDomain } from '@/composables/useDomain';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import { useUserSkin } from '@/composables/useUserSkin';

const { pendingCount } = useTxStatus();
const { modalAccountOpen } = useModal();
const { env, domain } = useDomain();

const { login, web3 } = useWeb3();
const { toggleSkin, getSkinIcon } = useUserSkin();

const loading = ref(false);

async function handleLogin(connector) {
  modalAccountOpen.value = false;
  loading.value = true;
  await login(connector);
  loading.value = false;
}
</script>

<template>
  <div :class="pendingCount ? 'h-[118px]' : 'h-[78px]'" />
  <div
    class="fixed w-screen top-0 left-0 z-20"
    :class="{ 'sm:ml-[67px] sm:w-[calc(100vw-67px)]': !domain }"
  >
    <div
      v-if="env === 'develop'"
      class="p-3 text-center bg-primary"
      style="color: white; font-size: 20px"
    >
      {{ $t('demoSite') }}
    </div>
    <nav id="topnav" class="border-b w-full bg-black">
      <Container>
        <div class="flex items-center" style="height: 78px">
          <div class="flex-auto flex items-center">
            <router-link
              :to="{ path: '/' }"
              class="flex items-center"
              style="font-size: 24px"
            >
              snapshot
            </router-link>
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated.value">
              <UiButton
                @click="modalAccountOpen = true"
                :loading="web3.authLoading"
                class="flex items-center float-left"
              >
                <UiAvatar
                  :address="web3.account"
                  size="18"
                  class="-mr-1 sm:mr-2 md:mr-2 lg:mr-2 xl:mr-2 -ml-1"
                />
                <span
                  v-if="web3.profile?.name || web3.profile?.ens"
                  v-text="web3.profile.name || web3.profile.ens"
                  class="hidden sm:block"
                />
                <span
                  v-else
                  v-text="shorten(web3.account)"
                  class="hidden sm:block"
                />
              </UiButton>
            </template>
            <UiButton
              v-if="!$auth.isAuthenticated.value"
              @click="modalAccountOpen = true"
              :loading="loading || web3.authLoading"
              :aria-label="$t('connectWallet')"
            >
              <span class="hidden sm:block" v-text="$t('connectWallet')" />
              <Icon
                name="login"
                size="20"
                class="sm:hidden -ml-2 -mr-2 block align-text-bottom"
              />
            </UiButton>
            <UiSidebarButton
              v-if="!domain"
              @click="toggleSkin"
              class="float-right ml-2"
              :aria-label="$t('toggleSkin')"
            >
              <Icon size="20" class="text-skin-link" :name="getSkinIcon()" />
            </UiSidebarButton>
          </div>
        </div>
      </Container>
    </nav>
    <div class="bg-primary text-white text-center py-2" v-if="pendingCount > 0">
      <UiLoading fill-white class="mr-2" />
      {{ $tc('delegate.pendingTransaction', pendingCount) }}
    </div>
    <teleport to="#modal">
      <ModalAccount
        :open="modalAccountOpen"
        @close="modalAccountOpen = false"
        @login="handleLogin"
      />
    </teleport>
  </div>
</template>
