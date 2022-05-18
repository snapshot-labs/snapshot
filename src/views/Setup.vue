<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useEns } from '@/composables/useEns';
import { useSpaces } from '@/composables/useSpaces';
import { useSpaceController } from '@/composables/useSpaceController';

const router = useRouter();
const route = useRoute();
const { web3, web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { setPageTitle } = useI18n();
const { spaces, spacesLoaded } = useSpaces();
const { ensAddress } = useSpaceController();

onMounted(() => {
  setPageTitle('page.title.setup');
});

const ownedEnsDomainsNoExistingSpace = computed(() => {
  //  filter ownedEnsDomains with spaces
  return ownedEnsDomains.value.filter(
    d => !Object.keys(spaces.value).includes(d.name)
  );
});

const goToStepTwo = key => {
  router.push({ name: 'setup', params: { step: 'controller' } });
  ensAddress.value = key;
};

const inputDomain = ref('');

// handle periodic lookup (every 5s) while registering new domain
let waitingForRegistrationInterval;
const waitForRegistration = () => {
  clearInterval(waitingForRegistrationInterval);
  waitingForRegistrationInterval = setInterval(loadOwnedEnsDomains, 5000);
};

const loadingOwnedEnsDomains = ref(true);

watch(
  web3Account,
  async () => {
    loadingOwnedEnsDomains.value = true;
    await loadOwnedEnsDomains();
    loadingOwnedEnsDomains.value = false;
  },
  { immediate: true }
);

// stop lookup when leaving page
onUnmounted(() => clearInterval(waitingForRegistrationInterval));
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="px-4 md:px-0">
        <h1 v-text="$t('setup.createASpace')" class="mb-4" />
      </div>
      <template v-if="web3Account">
        <LoadingRow v-if="loadingOwnedEnsDomains || !spacesLoaded" block />
        <!-- Step two - setup space controller -->
        <SetupController
          v-else-if="route.params.step === 'controller' && ensAddress"
          :ensAddress="ensAddress"
          :web3Account="web3Account"
        />

        <!-- Step three - setup space profile -->
        <SetupProfile
          v-else-if="route.params.step === 'profile' && ensAddress"
          :ensAddress="ensAddress"
          :web3Account="web3Account"
        />
        <BaseBlock v-else>
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
              <BaseButton
                v-for="(ens, i) in ownedEnsDomainsNoExistingSpace"
                :key="i"
                @click="goToStepTwo(ens.name)"
                class="w-full flex items-center justify-between"
                :primary="ownedEnsDomainsNoExistingSpace.length === 1"
              >
                {{ ens.name }}
                <BaseIcon name="go" size="22" class="-mr-2" />
              </BaseButton>
            </div>
            <div class="my-3">
              {{ $t('setup.orReigsterNewEns') }}
            </div>
            <RegisterENS
              v-model="inputDomain"
              @waitForRegistration="waitForRegistration"
            />
          </div>
          <div v-else>
            <div class="mb-3">
              {{ $t('setup.toCreateASpace') }}
            </div>
            <RegisterENS
              v-model="inputDomain"
              @waitForRegistration="waitForRegistration"
            />
          </div>
        </BaseBlock>
      </template>
      <BaseBlock v-else>
        <BaseButton
          @click="modalAccountOpen = true"
          :loading="web3.authLoading"
          class="w-full"
          primary
        >
          {{ $t('connectWallet') }}
        </BaseButton>
      </BaseBlock>
    </template>
    <template #sidebar-right>
      <BaseBlock class="text-skin-text">
        <BaseIcon
          name="gitbook"
          size="24"
          class="text-skin-text pr-2 !align-middle"
        />
        <i18n-t keypath="setup.helpDocsAndDiscordLinks" tag="span">
          <template v-slot:docs>
            <BaseLink link="https://docs.snapshot.org/spaces/create">
              documentation</BaseLink
            >
          </template>
          <template #discord>
            <BaseLink link="https://discord.gg/snapshot"> Discord</BaseLink>
          </template>
        </i18n-t>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
