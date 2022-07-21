<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const { env } = useApp();

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const { web3Account } = useWeb3();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();

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
    query: { step: 3 }
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
</script>

<template>
  <div>
    <LoadingRow v-if="loadingOwnedEnsDomains || spaceLoading" block />
    <div v-else>
      <h4 class="mb-2 px-4 md:px-0">{{ $t('setup.domain.title') }}</h4>
      <BaseMessageBlock
        v-if="env !== 'demo'"
        class="mb-4"
        level="info"
        is-responsive
      >
        {{ $t('setup.domain.ensMessage') }}
        <i18n-t
          keypath="setup.domain.ensMessageTestnet"
          tag="span"
          scope="global"
        >
          <template #link>
            <BaseLink link="https://demo.snapshot.org">
              {{ $t('setup.domain.tryDemo') }}
            </BaseLink>
          </template>
        </i18n-t>
      </BaseMessageBlock>

      <BaseMessageBlock
        v-if="defaultNetwork === '4'"
        level="info"
        class="mb-4"
        is-responsive
      >
        {{
          $t('setup.demoTestnetEnsMessage', {
            network: networks[defaultNetwork].name
          })
        }}
      </BaseMessageBlock>

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
