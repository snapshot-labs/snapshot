<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { useDomain } from '@/composables/useDomain';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';

const { pendingCount } = useTxStatus();
const { modalAccountOpen } = useModal();
const { env, domain } = useDomain();
const route = useRoute();

const { spaces } = useApp();
const { login, web3 } = useWeb3();

const loading = ref(false);
const modalAboutOpen = ref(false);
const modalLangOpen = ref(false);
const modalWalletNotice = ref(false);

const space = computed(() => {
  const key = domain || route.params.key;
  return spaces.value[key] ? spaces.value[key] : false;
});

function setTitle() {
  document.title = space.value.name ? space.value.name : 'Snapshot';
}

async function handleLogin(connector) {
  modalAccountOpen.value = false;
  loading.value = true;
  await login(connector);
  loading.value = false;
}

watch(space, () => {
  setTitle();
});

const walletConnectType = computed(() => web3.value.walletConnectType);

watch(walletConnectType, val => {
  if (val === 'Gnosis Safe Multisig') modalWalletNotice.value = true;
});

onMounted(() => setTitle());
</script>

<template>
  <Sticky class="mb-4">
    <div
      v-if="env === 'develop'"
      class="bg-blue text-center p-3"
      style="color: white; font-size: 20px"
    >{{ $t('demoSite') }}</div>
    <nav id="topnav" class="bg-black border-bottom width-full">
      <Container>
        <div class="flex-items-center d-flex" style="height: 78px">
          <div class="flex-auto flex-items-center d-flex">
            <router-link
              :to="{ name: 'home' }"
              class="flex-items-center d-inline-block d-flex"
              style="font-size: 24px; padding-top: 4px"
            >snapshot</router-link>
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated.value">
              <UiButton
                @click="modalAccountOpen = true"
                class="button-outline"
                :loading="web3.authLoading"
              >
                <UiAvatar
                  :imgsrc="
                    web3.profile?.image ? _getUrl(web3.profile.image) : ''
                  "
                  :address="web3.account"
                  size="16"
                  class="mr-n1 mr-sm-2 mr-md-2 mr-lg-2 mr-xl-2 ml-n1"
                />
                <span
                  v-if="web3.profile?.name || web3.profile?.ens"
                  v-text="web3.profile.name || web3.profile.ens"
                  class="hide-sm"
                />
                <span v-else v-text="_shorten(web3.account)" class="hide-sm" />
              </UiButton>
            </template>
            <UiButton
              v-if="!$auth.isAuthenticated.value"
              @click="modalAccountOpen = true"
              :loading="loading || web3.authLoading"
            >
              <span class="hide-sm" v-text="$t('connectWallet')" />
              <Icon
                name="login"
                size="20"
                class="mr-n2 ml-n2 hide-md hide-lg hide-xl v-align-text-bottom"
              />
            </UiButton>
            <UiButton @click="modalAboutOpen = true" class="ml-2">
              <span v-text="'?'" class="mr-n1 ml-n1" />
            </UiButton>
          </div>
        </div>
      </Container>
    </nav>
    <div class="bg-blue text-white text-center py-2" v-if="pendingCount > 0">
      <UiLoading :fill-white="true" class="mr-2" />
      {{ $tc('delegate.pendingTransaction', pendingCount) }}
    </div>
    <teleport to="#modal">
      <ModalAccount
        :open="modalAccountOpen"
        @close="modalAccountOpen = false"
        @login="handleLogin"
      />
      <ModalAbout
        :open="modalAboutOpen"
        @close="modalAboutOpen = false"
        @openLang="modalLangOpen = true"
      />
      <ModalSelectLanguage :open="modalLangOpen" @close="modalLangOpen = false" />
      <ModalWalletNotice :open="modalWalletNotice" @close="modalWalletNotice = false" />
    </teleport>
  </Sticky>
</template>
