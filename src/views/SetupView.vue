<script setup lang="ts">
import { onMounted, computed, ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useI18n } from '@/composables/useI18n';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { useClient } from '@/composables/useClient';
import { useStorage } from '@vueuse/core';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceController } from '@/composables/useSpaceController';
import { clearStampCache } from '@/helpers/utils';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const route = useRoute();
const router = useRouter();
const { web3Account } = useWeb3();
const { setPageTitle } = useI18n();

const notify = inject<any>('notify');
const { form, validate, showAllValidationErrors, formatSpace } =
  useSpaceSettingsForm();

onMounted(() => {
  if (!route.query.step) router.push({ query: { step: 1 } });
  else if (Number(route.query.step) > 3) router.push({ query: { step: 4 } });
  else if (!web3Account.value) router.push({ query: { step: 1 } });
  setPageTitle('page.title.setup');
});

const currentStep = computed(() => Number(route.query.step));

function nextStep() {
  router.push({ query: { step: currentStep.value + 1 } });
}

function previousStep() {
  router.push({ query: { step: currentStep.value - 1 } });
}

const creatingSpace = ref(false);

const { t } = useI18n();
const { pendingENSRecord, uriAddress, loadUriAddress } = useSpaceController();

const isValid = computed(() => {
  return validate.value === true;
});

const { send } = useClient();

const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

async function checkIfSpaceExists() {
  await loadExtentedSpaces([route.params.ens as string]);
  if (extentedSpaces.value?.some(space => space.id === route.params.ens)) {
    return;
  } else {
    await sleep(5000);
    await checkIfSpaceExists();
  }
}

const showPleaseWaitMessage = ref(false);

async function handleSubmit() {
  if (!isValid.value) return (showAllValidationErrors.value = true);
  creatingSpace.value = true;
  showPleaseWaitMessage.value = true;

  // Wait for ENS text-record transaction to confirm
  if (pendingENSRecord.value) {
    await sleep(3000);
    await handleSubmit();
  } else {
    await loadUriAddress();
    if (uriAddress.value !== web3Account.value)
      return (creatingSpace.value = false);

    // Adds connected wallet as admin so that the settings will show
    // in the sidebar after space creation
    form.value.admins = [web3Account.value];

    const formattedForm = formatSpace(form.value);
    // Create the space
    const result = await send(
      { id: route.params.ens },
      'settings',
      formattedForm
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

      // Redirect to the new space page
      router.push({
        name: 'spaceProposals',
        params: {
          key: route.params.ens
        }
      });
      notify(['green', t('notify.saved')]);
    }
    creatingSpace.value = false;
  }
}
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SetupSidebarStepper
        class="fixed"
        :current-step="currentStep"
        @change-step="value => router.push({ query: { step: value + 1 } })"
      />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('setup.createASpace')" />
      </div>
      <template v-if="web3Account || currentStep === 1">
        <SetupIntro v-if="currentStep === 1" />

        <SetupDomain v-if="currentStep === 2" />

        <SetupController
          v-else-if="currentStep === 3 && route.params.ens"
          :web3-account="web3Account"
          @next="nextStep"
        />

        <SetupProfile
          v-else-if="currentStep === 4 && route.params.ens"
          :web3-account="web3Account"
          @next="nextStep"
          @back="previousStep"
        />

        <SetupStrategy
          v-else-if="currentStep === 5 && route.params.ens"
          @next="nextStep"
          @back="previousStep"
        />

        <SetupVoting
          v-else-if="currentStep === 6 && route.params.ens"
          @next="nextStep"
          @back="previousStep"
        />

        <SetupCustomdomain
          v-else-if="currentStep === 7 && route.params.ens"
          @back="previousStep"
          @next="nextStep"
        />

        <SetupValidation
          v-else-if="currentStep === 8 && route.params.ens"
          :creating-space="creatingSpace"
          @back="previousStep"
          @create="handleSubmit"
        />
      </template>
    </template>
  </TheLayout>
</template>
