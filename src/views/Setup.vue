<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { setPageTitle } from '@/helpers/utils';
import RegisterENS from '@/components/RegisterENS.vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ENS_QUERY } from '@/helpers/queries';

const router = useRouter();
const { web3, web3Account } = useWeb3();
const { ensApolloQuery } = useApolloQuery();
const { modalAccountOpen } = useModal();

onMounted(() => {
  setPageTitle('page.title.setup');
});

const validTlds = ['eth', 'xyz', 'com', 'org', 'io', 'app', 'art'];
const ownedEnsDomains = ref([]);

const loadOwnedEnsDomains = async () => {
  if (web3Account.value) {
    const res = await ensApolloQuery({
      query: ENS_QUERY,
      variables: {
        id: web3Account.value.toLowerCase()
      }
    });
    ownedEnsDomains.value = res.account?.domains || [];
  } else {
    ownedEnsDomains.value = [];
  }
};

// used either on click on existing owned domain OR once a newly registered
// domain is returned by the ENS subgraph.
const goToSettings = key => {
  router.push({ name: 'spaceSettings', params: { key } });
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
loadOwnedEnsDomains().finally(() => loadingOwnedEnsDomains.value = false);
watch(web3Account, async () => {
  loadingOwnedEnsDomains.value = true;
  await loadOwnedEnsDomains();
  loadingOwnedEnsDomains.value = false;
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
      <template v-if="web3Account">
        <Block v-if="loadingOwnedEnsDomains" slim>
          <RowLoading class="my-2" />
        </Block>
        <Block v-else>
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
            <div class="my-3">
              {{ $t('setup.orReigsterNewEns') }}
            </div>
            <RegisterENS
              v-model="newDomain"
              :valid-tlds="validTlds"
              @waitForRegistration="waitForRegistration"
            />
          </div>
          <div v-else>
            <div class="mb-3">
              {{ $t('setup.toCreateASpace') }}
            </div>
            <RegisterENS
              v-model="newDomain"
              :valid-tlds="validTlds"
              @waitForRegistration="waitForRegistration"
            />
            <div class="mt-3">
              {{ $t('setup.correctAccountNote') }}
            </div>
          </div>
        </Block>
      </template>
      <Block v-else class="px-4 md:px-0">
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
  </Layout>
</template>
