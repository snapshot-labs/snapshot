<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

const { login, web3, web3Account } = useWeb3();
const { profiles, loadProfiles, loadingProfiles, reloadingProfile } =
  useProfiles();
const { modalAccountOpen } = useModal();
const auth = getInstance();

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
  <template v-if="auth.isAuthenticated.value">
    <MenuAccount :address="web3Account" @switchWallet="modalAccountOpen = true">
      <BaseButton
        :loading="web3.authLoading || loadingProfiles || reloadingProfile"
        class="flex items-center"
        data-testid="button-account-menu"
      >
        <AvatarUser
          :address="web3Account"
          size="18"
          class="-ml-1 -mr-1 sm:mr-2 md:mr-2 lg:mr-2 xl:mr-2"
        />
        <span
          v-if="profile?.name || profile?.ens"
          class="hidden sm:block"
          v-text="profile.name || profile.ens"
        />
        <span v-else class="hidden sm:block" v-text="shorten(web3Account)" />
      </BaseButton>
    </MenuAccount>
  </template>

  <BaseButton
    v-if="!auth.isAuthenticated.value"
    :loading="loading || web3.authLoading"
    :aria-label="$t('connectWallet')"
    data-testid="button-connect-wallet"
    @click="modalAccountOpen = true"
  >
    <span class="hidden sm:block" v-text="$t('connectWallet')" />
    <i-ho-login class="-ml-2 -mr-[11px] block align-text-bottom sm:hidden" />
  </BaseButton>

  <teleport to="#modal">
    <ModalAccount
      :open="modalAccountOpen"
      :profile="profile"
      @close="modalAccountOpen = false"
      @login="handleLogin"
    />
  </teleport>
</template>
