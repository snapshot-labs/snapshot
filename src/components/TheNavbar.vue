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
          <ButtonSidebar
            v-if="!domain"
            @click="showSidebar = !showSidebar"
            class="-ml-3 border-0 sm:hidden"
          >
            <BaseIcon v-if="showSidebar" name="close" size="20" />
            <BaseIcon v-else class="rotate-90" name="threedots" size="20" />
          </ButtonSidebar>
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
                  v-text="profile.name || profile.ens"
                  class="hidden sm:block"
                />
                <span
                  v-else
                  v-text="shorten(web3Account)"
                  class="hidden sm:block"
                />
              </BaseButton>
            </DropdownAccount>
          </template>

          <BaseButton
            v-if="!auth.isAuthenticated.value"
            @click="modalAccountOpen = true"
            :loading="loading || web3.authLoading"
            :aria-label="$t('connectWallet')"
          >
            <span class="hidden sm:block" v-text="$t('connectWallet')" />
            <i-ho-login
              class="-ml-2 -mr-[11px] block align-text-bottom sm:hidden"
            />
          </BaseButton>
          <NavbarNotifications v-if="web3Account && !domain" />
          <ButtonLanguage small v-if="domain" />
        </div>
      </div>
    </BaseContainer>
  </nav>
  <div
    class="flex justify-center bg-primary py-2 text-center text-white"
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
      :profile="profile"
    />
  </teleport>
</template>
