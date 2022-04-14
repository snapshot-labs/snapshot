<script setup lang="ts">
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useModal } from '@/composables/useModal';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

const { pendingCount } = useTxStatus();
const { modalAccountOpen } = useModal();
const { env, showSidebar, domain } = useApp();
const auth = getInstance();
const { login, web3, web3Account } = useWeb3();

const loading = ref(false);

async function handleLogin(connector) {
  modalAccountOpen.value = false;
  loading.value = true;
  await login(connector);
  loading.value = false;
}
</script>

<template>
  <div
    v-if="env === 'develop'"
    class="p-3 text-center bg-primary"
    style="color: white; font-size: 20px"
  >
    {{ $t('demoSite') }}
  </div>
  <nav id="topnav">
    <BaseContainer class="pl-0 pr-3 sm:!px-4">
      <div class="flex items-center py-2">
        <div class="flex-auto flex items-center ml-3">
          <UiSidebarButton
            v-if="!domain"
            @click="showSidebar = !showSidebar"
            class="border-0 sm:hidden -ml-3"
          >
            <BaseIcon v-if="showSidebar" name="close" size="20" />
            <BaseIcon v-else class="rotate-90" name="threedots" size="20" />
          </UiSidebarButton>
          <router-link
            :to="{ path: '/' }"
            class="flex items-center sm:-ml-3"
            style="font-size: 24px"
          >
            snapshot
          </router-link>
        </div>
        <div :key="web3Account" class="flex space-x-2">
          <template v-if="auth.isAuthenticated.value">
            <BaseButton
              @click="modalAccountOpen = true"
              :loading="web3.authLoading"
              class="flex items-center"
            >
              <BaseAvatar
                :address="web3Account"
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
                v-text="shorten(web3Account)"
                class="hidden sm:block"
              />
            </BaseButton>
          </template>

          <BaseButton
            v-if="!auth.isAuthenticated.value"
            @click="modalAccountOpen = true"
            :loading="loading || web3.authLoading"
            :aria-label="$t('connectWallet')"
          >
            <span class="hidden sm:block" v-text="$t('connectWallet')" />
            <BaseIcon
              name="login"
              size="20"
              class="sm:hidden -ml-2 -mr-2 block align-text-bottom"
            />
          </BaseButton>
          <NavbarNotifications v-if="web3Account && !domain" />
        </div>
      </div>
    </BaseContainer>
  </nav>
  <div
    class="flex justify-center bg-primary text-white text-center py-2"
    v-if="pendingCount > 0"
  >
    <LoadingSpinner fill-white class="mr-2" />
    {{ $tc('delegate.pendingTransaction', pendingCount) }}
  </div>
  <teleport to="#modal">
    <ModalAccount
      :open="modalAccountOpen"
      @close="modalAccountOpen = false"
      @login="handleLogin"
    />
  </teleport>
</template>
