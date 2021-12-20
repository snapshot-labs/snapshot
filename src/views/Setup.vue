<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { setPageTitle } from '@/helpers/utils';
import RegisterENS from '@/components/RegisterENS.vue';

const router = useRouter();
const { web3, web3Account } = useWeb3();
const { validEnsTlds, ownedEnsDomains, loadOwnedEnsDomains } = useEns();
const { modalAccountOpen } = useModal();

onMounted(() => {
  setPageTitle('page.title.setup');
});

// used either on click on existing owned domain OR once a newly registered
// domain is returned by the ENS subgraph.
const goToSettings = key => {
  router.push({ name: 'spaceSettings', params: { key } });
};

// input for new domain registration
const newDomain = reactive({
  name: '',
  tld: validEnsTlds[0]
});

// indicates whether to periodically check for new domains
// (after clicking on "Register")
const waitingForRegistration = ref(false);
// handle periodic lookup (every 10s) while registering new domain
let waitingForRegistrationInterval;
const waitForRegistration = () => {
  waitingForRegistration.value = true;
  clearInterval(waitingForRegistrationInterval);
  waitingForRegistrationInterval = setInterval(loadOwnedEnsDomains, 10000);
};

// If after loading domains, we have more than before, there was a new registration.
// If the new domain matches the one that was input, directly jump to settings page.
watch(ownedEnsDomains, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    waitingForRegistration.value = false;
    clearInterval(waitingForRegistrationInterval);
    if (newVal.find(d => d.name === `${newDomain.name}.${newDomain.tld}`)) {
      goToSettings(`${newDomain.name}.${newDomain.tld}`);
    }
  }
});

// load domains initially and update on account change
const loadingOwnedEnsDomains = ref(true);
loadOwnedEnsDomains().finally(() => (loadingOwnedEnsDomains.value = false));
watch(web3Account, () => {
  loadOwnedEnsDomains();
  waitingForRegistration.value = false;
});

// stop lookup when leaving page
onUnmounted(() => clearInterval(waitingForRegistrationInterval));
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ path: '/' }" class="text-color">
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('backToHome') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 class="mb-4">
          {{ $t('setup.createASpace') }}
          <a target="_blank" href="https://docs.snapshot.org/spaces/create">
            <Icon name="info" size="24" class="text-color p-1" />
          </a>
        </h1>
      </div>
      <Block>
        <div v-if="web3Account" class="px-4 md:px-0">
          <UiLoading v-if="loadingOwnedEnsDomains" />
          <div v-else>
            <div v-if="ownedEnsDomains.length">
              <div class="mb-3">
                {{
                  $t(
                    ownedEnsDomains.length > 1
                      ? 'setup.chooseExistingEns'
                      : 'setup.useSingleExistingEns'
                  )
                }}
              </div>
              <div class="space-y-2">
                <UiButton
                  v-for="(ens, i) in ownedEnsDomains"
                  :key="i"
                  @click="goToSettings(ens.name)"
                  class="w-full flex items-center justify-between"
                  :primary="ownedEnsDomains.length === 1"
                >
                  {{ ens.name }}
                  <Icon name="go" size="22" :class="ownedEnsDomains.length === 1 ? 'text-white' : 'text-color'" />
                </UiButton>
              </div>
              <div
                v-if="waitingForRegistration"
                class="
                  w-full
                  rounded-3xl
                  border
                  px-3
                  py-2
                  text-center text-color
                  opacity-30
                  animate-pulse
                  mt-3
                "
              >
                {{ $t('setup.waitingForRegistration') }}
              </div>
              <div class="my-3">
                {{ $t('setup.orReigsterNewEns') }}
              </div>
              <RegisterENS
                v-model:name="newDomain.name"
                v-model:tld="newDomain.tld"
                @waitForRegistration="waitForRegistration"
              />
            </div>
            <div v-else>
              <div class="mb-3">
                {{ $t('setup.toCreateASpace') }}
              </div>
              <div
                v-if="waitingForRegistration"
                class="
                  w-full
                  rounded-3xl
                  border
                  px-3
                  py-2
                  text-center text-color
                  opacity-30
                  animate-pulse
                  mb-3
                "
              >
                {{ $t('setup.waitingForRegistration') }}
              </div>
              <RegisterENS
                v-model:name="newDomain.name"
                v-model:tld="newDomain.tld"
                @waitForRegistration="waitForRegistration"
              />
              <div class="mt-3">
                {{ $t('setup.correctAccountNote') }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="px-4 md:px-0">
          <UiButton
            @click="modalAccountOpen = true"
            :loading="web3.authLoading"
            class="w-full mt-2"
            primary
          >
            {{ $t('connectWallet') }}
          </UiButton>
        </div>
      </Block>
    </template>
  </Layout>
</template>
