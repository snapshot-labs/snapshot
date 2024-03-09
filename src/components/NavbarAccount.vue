<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useStorage } from '@vueuse/core';

const { login, web3, web3Account } = useWeb3();
const { profiles, loadProfiles } = useProfiles();
const { modalAccountOpen } = useModal();
const auth = getInstance();

const loading = ref(false);
const modalTermsOpen = ref(false);

const termsAccepted = useStorage('snapshot.termsAccepted', false);

async function handleLogin(connector) {
  modalAccountOpen.value = false;
  loading.value = true;
  termsAccepted.value = true;
  await login(connector);
  loading.value = false;
}

const profile = computed(() => profiles.value[web3Account.value]);
watch(
  () => web3Account,
  () => loadProfiles([web3Account.value]),
  { immediate: true }
);
</script>

<template>
  <template v-if="auth.isAuthenticated && web3Account">
    <MenuAccount
      :address="web3Account"
      @switch-wallet="modalAccountOpen = true"
    >
      <TuneButton
        :loading="web3.authLoading"
        class="flex items-center"
        data-testid="button-account-menu"
      >
        <AvatarUser
          :address="web3Account"
          size="20"
          class="-ml-1 -mr-1 sm:mr-2 md:mr-2 lg:mr-2 xl:mr-2"
        />
        <span
          v-if="profile?.name || profile?.ens"
          class="hidden sm:block"
          v-text="profile.name || profile.ens"
        />
        <span v-else class="hidden sm:block" v-text="shorten(web3Account)" />
      </TuneButton>
    </MenuAccount>
  </template>

  <TuneButton
    v-if="!auth.isAuthenticated.value"
    :loading="loading || web3.authLoading"
    :aria-label="$t('connectWallet')"
    data-testid="button-connect-wallet"
    @click="modalAccountOpen = true"
  >
    <span class="hidden sm:block" v-text="$t('connectWallet')" />
    <i-ho-login class="-ml-2 -mr-[11px] block align-text-bottom sm:hidden" />
  </TuneButton>

  <teleport to="#modal">
    <ModalAccount
      :open="modalAccountOpen"
      :profile="profile"
      @close="modalAccountOpen = false"
      @login="handleLogin"
      @open-terms="modalTermsOpen = true"
    />
  </teleport>
  <ModalSnapshotTerms :open="modalTermsOpen" @close="modalTermsOpen = false" />
</template>
