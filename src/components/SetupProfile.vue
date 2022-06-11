<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { useClient } from '@/composables/useClient';
import { useI18n } from '@/composables/useI18n';
import { useRouter, useRoute } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceController } from '@/composables/useSpaceController';
import { refDebounced } from '@vueuse/core';
import { shorten, clearAvatarCache } from '@/helpers/utils';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const props = defineProps<{
  web3Account: string;
}>();

const notify = inject<any>('notify');
const router = useRouter();
const route = useRoute();
const { form, validate, formatSpace, getErrorMessage } = useSpaceSettingsForm();

const creatingSpace = ref(false);

const { t } = useI18n();
const { pendingENSRecord, loadingTextRecord, uriAddress, loadUriAddress } =
  useSpaceController();

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
const debouncedShowPleaseWaitMessage = refDebounced(
  showPleaseWaitMessage,
  4000
);

async function handleSubmit() {
  creatingSpace.value = true;
  showPleaseWaitMessage.value = true;

  // Wait for ENS text-record transaction to confirm
  if (pendingENSRecord.value) {
    await sleep(3000);
    await handleSubmit();
  } else {
    await loadUriAddress();
    if (uriAddress.value !== props.web3Account)
      return (creatingSpace.value = false);

    // Adds connected wallet as admin so that the settings will show
    // in the sidebar after space creation
    form.value.admins = [props.web3Account];

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
      await clearAvatarCache(route.params.ens as string);
      creatingSpace.value = false;
      console.log('Result', result);

      // Save created space to local storage
      const createdSpaces = useStorage(
        `snapshot.createdSpaces.${props.web3Account.slice(0, 8).toLowerCase()}`,
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

function addDefaultStrategy() {
  form.value.strategies.push({
    name: 'ticket',
    network: '1',
    params: {
      symbol: 'VOTE'
    }
  });
}

function addDefaultNetwork() {
  form.value.network = '1';
}

onMounted(() => {
  addDefaultStrategy();
  addDefaultNetwork();
});
</script>

<template>
  <div class="space-y-4">
    <SettingsProfileBlock
      v-model:name="form.name"
      v-model:about="form.about"
      v-model:categories="form.categories"
      v-model:avatar="form.avatar"
      v-model:private="form.private"
      v-model:terms="form.terms"
      :get-error-message="getErrorMessage"
    />

    <SettingsLinkBlock
      v-model:twitter="form.twitter"
      v-model:github="form.github"
      v-model:website="form.website"
      :get-error-message="getErrorMessage"
    />

    <SettingsStrategiesBlock
      :form="form"
      :get-error-message="getErrorMessage"
      @update-strategies="val => (form.strategies = val)"
      @update-network="val => (form.network = val)"
      @update-symbol="val => (form.symbol = val)"
    />

    <BaseBlock>
      <BaseButton
        class="w-full"
        primary
        :disabled="
          !isValid || (uriAddress !== web3Account && !pendingENSRecord)
        "
        :loading="creatingSpace"
        @click="handleSubmit"
      >
        {{ $t('createButton') }}
      </BaseButton>
      <div>
        <BaseMessage
          v-if="
            uriAddress &&
            uriAddress !== web3Account &&
            !loadingTextRecord &&
            !pendingENSRecord
          "
          level="warning"
          class="!mt-4"
        >
          {{
            $t('setup.notControllerAddress', { wallet: shorten(uriAddress) })
          }}
        </BaseMessage>
        <BaseMessage
          v-else-if="debouncedShowPleaseWaitMessage && creatingSpace"
          level="info"
          class="!mt-4"
        >
          {{ $t('setup.pleaseWaitMessage') }}
        </BaseMessage>
      </div>
    </BaseBlock>
  </div>
</template>
