<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { shorten } from '@/helpers/utils';
import { useModal } from '@/composables/useModal';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useProfiles } from '@/composables/useProfiles';

const { pendingCount } = useTxStatus();
const { modalAccountOpen } = useModal();
const { env, showSidebar, domain } = useApp();
const auth = getInstance();
const { login, web3, web3Account } = useWeb3();
const { profiles, loadProfiles, loadingProfiles, reloadingProfile } =
  useProfiles();

const loading = ref(false);

async function handleLogin(connector) {
  modalAccountOpen.value = false;
  loading.value = true;
  await login(connector);
  loading.value = false;
}

const profile = computed(() => profiles.value[web3Account.value]);

watchEffect(() => {
  loadProfiles([web3Account.value]);
});
</script>

<template>
  <div
    v-if="env === 'develop'"
    class="bg-primary p-3 text-center"
    style="color: white; font-size: 20px"
  >
    {{ $t('demoSite') }}
  </div>
  <nav id="topnav">
    <BaseContainer class="pl-0 pr-3 sm:!px-4">
      <div class="flex items-center py-[12px]">
        <div class="ml-3 flex flex-auto items-center">
          <ButtonSidebar class="sm:hidden" @click="showSidebar = !showSidebar">
            <i-ho-dots-vertical class="text-skin-link" />
          </ButtonSidebar>
          <router-link
            :to="{ path: '/' }"
            class="hidden items-center sm:block"
            style="font-size: 24px"
          >
            snapshot
          </router-link>
        </div>
        <div :key="web3Account" class="flex space-x-2">
          <template v-if="auth.isAuthenticated.value">
            <DropdownAccount
              :address="web3Account"
              @switchWallet="modalAccountOpen = true"
            >
              <BaseButton
                :loading="
                  web3.authLoading || loadingProfiles || reloadingProfile
                "
                class="flex items-center"
              >
                <AvatarUser
                  :address="web3Account"
                  size="18"
                  class="-mr-1 -ml-1 sm:mr-2 md:mr-2 lg:mr-2 xl:mr-2"
                />
                <span
                  v-if="profile?.name || profile?.ens"
                  class="hidden sm:block"
                  v-text="profile.name || profile.ens"
                />
                <span
                  v-else
                  class="hidden sm:block"
                  v-text="shorten(web3Account)"
                />
              </BaseButton>
            </DropdownAccount>
          </template>

          <BaseButton
            v-if="!auth.isAuthenticated.value"
            :loading="loading || web3.authLoading"
            :aria-label="$t('connectWallet')"
            @click="modalAccountOpen = true"
          >
            <span class="hidden sm:block" v-text="$t('connectWallet')" />
            <i-ho-login
              class="-ml-2 -mr-[11px] block align-text-bottom sm:hidden"
            />
          </BaseButton>
          <NavbarNotifications v-if="web3Account && !domain" />
          <ButtonLanguage v-if="domain" small />
        </div>
      </div>
    </BaseContainer>
  </nav>
  <div
    v-if="pendingCount > 0"
    class="flex justify-center bg-primary py-2 text-center text-white"
  >
    <LoadingSpinner fill-white class="mr-2" />
    {{ $tc('delegate.pendingTransaction', pendingCount) }}
  </div>
  <teleport to="#modal">
    <ModalAccount
      :open="modalAccountOpen"
      :profile="profile"
      @close="modalAccountOpen = false"
      @login="handleLogin"
    />
  </teleport>
</template>
