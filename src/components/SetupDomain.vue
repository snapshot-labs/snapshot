<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';

const { web3Account } = useWeb3();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();

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
    await loadExtentedSpaces(ownedEnsDomains.value.map(d => d.name));
  },
  { immediate: true }
);

const domainsWithoutExistingSpace = computed(() => {
  const spaces = extentedSpaces.value.map(space => space.id);
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
</script>

<template>
  <div>
    <LoadingRow v-if="loadingOwnedEnsDomains || spaceLoading" block />
    <BaseBlock v-else>
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
            @click="nextStep(ens.name)"
            class="w-full flex items-center justify-between"
            :primary="domainsWithoutExistingSpace.length === 1"
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
</template>
