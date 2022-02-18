<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useEns } from '@/composables/useEns';
import { useApp } from '@/composables/useApp';

const router = useRouter();
const route = useRoute();
const { web3, web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { setPageTitle } = useI18n();
const { explore } = useApp();

onMounted(() => {
  setPageTitle('page.title.setup');
});

const ensAddress = computed(() => route.params.ensAddress);

const ownedEnsDomainsNoExistingSpace = computed(() => {
  //  filter ownedEnsDomains with explore.spaces
  return ownedEnsDomains.value.filter(
    d => !Object.keys(explore.value.spaces).includes(d.name)
  );
});

// used either on click on existing owned domain OR once a newly registered
// domain is returned by the ENS subgraph.
const goToSettings = key => {
  router.push({ name: 'setup', params: { ensAddress: key } });
};

// input for new domain registration
const newDomain = ref('');

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
    if (newVal.find(d => d.name === newDomain.value)) {
      goToSettings(newDomain.value);
    }
  }
});

// load domains initially and update on account change
// using finally() here because await at top level would require the component to be inside a <Suspense> block
// https://v3.vuejs.org/guide/migration/suspense.html#introduction
const loadingOwnedEnsDomains = ref(true);
loadOwnedEnsDomains().finally(() => (loadingOwnedEnsDomains.value = false));
watch(web3Account, async () => {
  loadingOwnedEnsDomains.value = true;
  await loadOwnedEnsDomains();
  loadingOwnedEnsDomains.value = false;
  waitingForRegistration.value = false;
});

const cameFromSettings = computed(() =>
  window.history.state.back?.includes('settings')
);

// stop lookup when leaving page
onUnmounted(() => clearInterval(waitingForRegistrationInterval));
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 md:px-0">
        <h1
          v-text="
            ensAddress && cameFromSettings
              ? $t('setup.controller')
              : $t('setup.createASpace')
          "
          class="mb-4"
        />
      </div>
      <template v-if="web3Account">
        <Block v-if="loadingOwnedEnsDomains" slim>
          <RowLoading class="my-2" />
        </Block>
        <SetupController
          v-else-if="ensAddress"
          :ensAddress="ensAddress"
          :ownedEnsDomains="ownedEnsDomains"
        />
        <Block
          v-else
          :title="$t('setup.selectEnsForSpace')"
          icon="info"
          :iconTooltip="$t('setup.spaceNeedsEnsAddress')"
        >
          <div v-if="ownedEnsDomainsNoExistingSpace.length">
            <div class="mb-3">
              {{
                $t(
                  ownedEnsDomainsNoExistingSpace.length > 1
                    ? 'setup.chooseExistingEns'
                    : 'setup.useSingleExistingEns'
                )
              }}
            </div>
            <div class="space-y-2">
              <UiButton
                v-for="(ens, i) in ownedEnsDomainsNoExistingSpace"
                :key="i"
                @click="goToSettings(ens.name)"
                class="w-full flex items-center justify-between"
                :primary="ownedEnsDomainsNoExistingSpace.length === 1"
              >
                {{ ens.name }}
                <Icon name="go" size="22" class="-mr-2" />
              </UiButton>
            </div>
            <div class="my-3">
              {{ $t('setup.orReigsterNewEns') }}
            </div>
            <RegisterENS
              v-model="newDomain"
              @waitForRegistration="waitForRegistration"
            />
          </div>
          <div v-else>
            <div class="mb-3">
              {{ $t('setup.toCreateASpace') }}
            </div>
            <RegisterENS
              v-model="newDomain"
              @waitForRegistration="waitForRegistration"
            />
          </div>
        </Block>
      </template>
      <Block v-else>
        <UiButton
          @click="modalAccountOpen = true"
          :loading="web3.authLoading"
          class="w-full"
          primary
        >
          {{ $t('connectWallet') }}
        </UiButton>
      </Block>
    </template>
    <template #sidebar-right>
      <Block>
        <Icon name="gitbook" size="24" class="text-color pr-2 !align-middle" />
        <span v-html="$t('setup.helpDocsAndDiscordLinks')" />
      </Block>
    </template>
  </Layout>
</template>
