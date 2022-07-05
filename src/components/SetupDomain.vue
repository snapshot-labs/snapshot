<script setup lang="ts">
import { ref, watch, onUnmounted, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useStorage } from '@vueuse/core';

const { env } = useApp();

const showSetupDomainDismissable = useStorage(
  'snapshot.showSetupDomainDismissable',
  true
);

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const { web3Account } = useWeb3();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();
const { resetForm } = useSpaceSettingsForm();

const router = useRouter();

const inputDomain = ref('');
const loadingOwnedEnsDomains = ref(false);

watch(
  web3Account,
  async () => {
    loadingOwnedEnsDomains.value = true;
    await loadOwnedEnsDomains();
    loadingOwnedEnsDomains.value = false;
    if (ownedEnsDomains.value.map(d => d.name).length)
      await loadExtentedSpaces(ownedEnsDomains.value.map(d => d.name));
  },
  { immediate: true }
);

const domainsWithoutExistingSpace = computed(() => {
  const spaces = clone(extentedSpaces.value.map(space => space.id));
  return ownedEnsDomains.value.filter(d => !spaces.includes(d.name));
});

const nextStep = key => {
  router.push({
    name: 'setup',
    params: { ens: key },
    query: { step: 2 }
  });
};

// handle periodic lookup (every 5s) while registering new domain
let waitingForRegistrationInterval;
const waitForRegistration = () => {
  clearInterval(waitingForRegistrationInterval);
  waitingForRegistrationInterval = setInterval(loadOwnedEnsDomains, 5000);
};

// stop lookup when leaving
onUnmounted(() => clearInterval(waitingForRegistrationInterval));

onMounted(() => resetForm());
</script>

<template>
  <div>
    <LoadingRow v-if="loadingOwnedEnsDomains || spaceLoading" block />
    <div v-else>
      <h4>Setup your space domain</h4>
      <BaseBlock v-if="showSetupDomainDismissable" class="relative my-3">
        <h3 class="mt-0 font-mono">ENS domain</h3>
        One thing you need, before you can create your own space, is an ENS
        domain. It is required to store information about your space as well as
        a matter of bot protection.
        <span v-if="domainsWithoutExistingSpace.length">
          <br /><br />
          You will have to update a text record on one of your ENS domains, in
          order to create a space. You can try the demo on the Rinkeby test
          network first.
        </span>
        <span v-if="!domainsWithoutExistingSpace.length">
          <br /><br />
          An ENS domain is a human readable name for an address. Registering one
          <u>costs ETH</u>. If you are not familiar with ENS yet, take a moment
          to read about it and try the demo on the Rinkeby test network first.
        </span>
        <div class="mt-4 space-x-3">
          <BaseButton v-if="env !== 'demo'" primary> Try demo </BaseButton>
          <BaseButton
            v-if="!domainsWithoutExistingSpace.length"
            @click="$router.push({ name: 'about' })"
          >
            About ENS
          </BaseButton>
        </div>
        <BaseButtonIcon
          class="absolute right-3 top-3"
          @click="showSetupDomainDismissable = false"
        >
          <i-ho-x class="text-base" />
        </BaseButtonIcon>
      </BaseBlock>
      <BaseMessage v-if="defaultNetwork === '4'" level="info" class="my-3">
        {{
          $t('setup.demoTestnetEnsMessage', {
            network: networks[defaultNetwork].name
          })
        }}
      </BaseMessage>
      <BaseBlock>
        <div v-if="domainsWithoutExistingSpace.length">
          <div class="mb-3">
            {{
              $t(
                domainsWithoutExistingSpace.length > 1
                  ? 'setup.chooseExistingEns'
                  : 'setup.useSingleExistingEns'
              )
            }}
          </div>
          <div class="space-y-2">
            <BaseButton
              v-for="(ens, i) in domainsWithoutExistingSpace"
              :key="i"
              class="flex w-full items-center justify-between"
              :primary="domainsWithoutExistingSpace.length === 1"
              @click="nextStep(ens.name)"
            >
              {{ ens.name }}
              <BaseIcon name="go" size="22" class="-mr-2" />
            </BaseButton>
          </div>
          <div class="my-3">
            {{ $t('setup.orReigsterNewEns') }}
          </div>
          <SetupDomainRegister
            v-model.trim="inputDomain"
            @waitForRegistration="waitForRegistration"
          />
        </div>
        <div v-else>
          <div class="mb-3">
            {{ $t('setup.toCreateASpace') }}
          </div>
          <SetupDomainRegister
            v-model.trim="inputDomain"
            @waitForRegistration="waitForRegistration"
          />
        </div>
      </BaseBlock>
    </div>
  </div>
</template>
