<script setup lang="ts">
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { useStorage } from '@vueuse/core';
import { clearStampCache } from '@/helpers/utils';

useMeta({
  title: {
    key: 'metaInfo.setup.title'
  },
  description: {
    key: 'metaInfo.setup.description'
  }
});

enum Step {
  GETTING_STARTED,
  ENS,
  PROFILE,
  STRATEGY,
  EXTRAS
}

const route = useRoute();
const router = useRouter();
const { web3Account } = useWeb3();
const { notify } = useFlashNotification();
const { prunedForm, isValid, resetForm } = useFormSpaceSettings('setup');
const { t } = useI18n();
const { send } = useClient();
const { loadSpaces, spaces } = useSpaces();

const creatingSpace = ref(false);

const currentStep = computed(() => Number(route.query.step));

async function checkIfSpaceExists() {
  await loadSpaces([route.params.ens as string]);
  if (spaces.value?.some(space => space.id === route.params.ens)) {
    return;
  } else {
    await sleep(5000);
    await checkIfSpaceExists();
  }
}

async function handleSubmit() {
  if (!isValid.value) {
    return;
  }
  creatingSpace.value = true;

  // Create the space
  const result = await send(
    { id: route.params.ens as string },
    'settings',
    prunedForm.value
  );
  if (result.id) {
    // Wait for the space to be available on the HUB
    await checkIfSpaceExists();
    await clearStampCache(route.params.ens as string);
    creatingSpace.value = false;
    console.log('Result', result);

    // Save created space to local storage
    const createdSpaces = useStorage(
      `snapshot.createdSpaces.${web3Account.value.slice(0, 8).toLowerCase()}`,
      {}
    );
    createdSpaces.value[route.params.ens as string] = {
      showMessage: true
    };

    resetForm();

    // Redirect to the new space page
    notify(['green', t('notify.saved')]);
    router.push({
      name: 'spaceProposals',
      params: {
        key: route.params.ens
      }
    });
  }
  creatingSpace.value = false;
}

function nextStep(ensKey = '') {
  router.push({
    params: ensKey ? { ens: ensKey } : {},
    query: { step: currentStep.value + 1 }
  });
}

function previousStep() {
  router.push({ query: { step: currentStep.value - 1 } });
}

function pushStepOne() {
  router.push({ query: { step: Step.GETTING_STARTED } });
}

onMounted(() => {
  if (!route.query.step || !web3Account.value) pushStepOne();
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SetupSidebarStepper
        class="fixed hidden lg:block"
        :current-step="currentStep"
        @change-step="value => router.push({ query: { step: value } })"
      />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('setup.createASpace')" />
      </div>
      <template v-if="web3Account || currentStep === Step.GETTING_STARTED">
        <SetupIntro
          v-if="currentStep === Step.GETTING_STARTED"
          @next="nextStep"
        />

        <SetupDomain v-if="currentStep === Step.ENS" @next="nextStep" />

        <SetupProfile
          v-if="currentStep === Step.PROFILE && route.params.ens"
          @next="nextStep"
          @back="previousStep"
        />

        <SetupStrategy
          v-show="currentStep === Step.STRATEGY && route.params.ens"
          @next="nextStep"
          @back="previousStep"
        />

        <SetupExtras
          v-if="currentStep === Step.EXTRAS && route.params.ens"
          :creating-space="creatingSpace"
          @back="previousStep"
          @next="handleSubmit"
        />
      </template>
    </template>
  </TheLayout>
</template>
