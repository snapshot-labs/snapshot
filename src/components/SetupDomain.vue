<script setup lang="ts">
import { ref, watch, onUnmounted, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const { web3Account } = useWeb3();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();
const { resetForm } = useSpaceSettingsForm();

const router = useRouter();
const route = useRoute();

const inputDomain = ref('');
const loadingOwnedEnsDomains = ref(false);

watch(
  web3Account,
  async () => {
    if (route.params.step) return;
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
    params: { step: 'controller', ens: key }
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
      <BaseMessage v-if="defaultNetwork === '4'" level="info" class="mb-3">
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
