<script setup lang="ts">
import { shorten } from '@/helpers/utils';

const { connect, web3Account, isConnecting, isConnected } = useWeb3();
const { profiles, loadProfiles, loadingProfiles, reloadingProfile } =
  useProfiles();
const { modalAccountOpen } = useModal();

const loading = ref(false);

async function handleConnect(connector) {
  modalAccountOpen.value = false;
  connect({ connector });
}

const profile = computed(() => profiles.value[web3Account.value]);

watchEffect(() => {
  loadProfiles([web3Account.value]);
});
</script>

<template>
  <template v-if="isConnected && web3Account">
    <MenuAccount :address="web3Account" @switchWallet="modalAccountOpen = true">
      <BaseButton
        :loading="isConnecting || loadingProfiles || reloadingProfile"
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
      </BaseButton>
    </MenuAccount>
  </template>

  <BaseButton
    v-if="!isConnected"
    :loading="loading || isConnecting"
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
      @connect="handleConnect"
    />
  </teleport>
</template>
