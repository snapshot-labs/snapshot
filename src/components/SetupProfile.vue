<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { sleep, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { useValidationErrors } from '@/composables/useValidationErrors';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useClient } from '@/composables/useClient';
import { useI18n } from '@/composables/useI18n';
import { useRouter, useRoute } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceController } from '@/composables/useSpaceController';
import { refDebounced } from '@vueuse/core';
import { shorten } from '@/helpers/utils';

const props = defineProps<{
  web3Account: string;
}>();

const notify = inject<any>('notify');
const router = useRouter();
const route = useRoute();

const visitedFields = ref<string[]>([]);
const modalNetworksOpen = ref(false);
const creatingSpace = ref(false);

// Space setup form
const form = ref({
  name: '',
  symbol: '',
  network: '',
  admins: [] as string[],
  // Adds "ticket" strategy with VOTE symbol as default/placeholder strategy
  strategies: [
    {
      name: 'ticket',
      params: {}
    }
  ]
});

const { validationErrorMessage } = useValidationErrors();
const { t } = useI18n();
const { pendingENSRecord, loadingTextRecord, uriAddress, loadUriAddress } =
  useSpaceController();

const spaceValidationErrors = computed(
  () => validateSchema(schemas.space, form.value) ?? []
);

function errorIfVisited(field) {
  return visitedFields.value.includes(field)
    ? validationErrorMessage(field, spaceValidationErrors.value)
    : '';
}

const isValid = computed(() => {
  return spaceValidationErrors.value === true;
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
    // Create the space
    const result = await send({ id: route.params.ens }, 'settings', form.value);
    if (result.id) {
      // Wait for the space to be available on the HUB
      await checkIfSpaceExists();
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
</script>

<template>
  <div>
    <BaseBlock>
      <div class="space-y-2">
        <UiInput
          v-model="form.name"
          :error="errorIfVisited('name')"
          @blur="visitedFields.push('name')"
          focus-on-mount
        >
          <template v-slot:label>{{ $t(`settings.name`) }}*</template>
        </UiInput>
        <UiInput
          v-model="form.symbol"
          placeholder="e.g. BAL"
          :error="errorIfVisited('symbol')"
          @blur="visitedFields.push('symbol')"
        >
          <template v-slot:label> {{ $t(`settings.symbol`) }}* </template>
        </UiInput>
        <UiInput
          @click="modalNetworksOpen = true"
          :error="errorIfVisited('network')"
          @blur="visitedFields.push('network')"
        >
          <template v-slot:selected>
            {{
              form.network ? networks[form.network].name : $t('selectNetwork')
            }}
          </template>
          <template v-slot:label> {{ $t(`settings.network`) }}* </template>
        </UiInput>
        <BaseButton
          @click="handleSubmit"
          class="w-full !mt-4"
          primary
          :disabled="
            !isValid || (uriAddress !== web3Account && !pendingENSRecord)
          "
          :loading="creatingSpace"
        >
          {{ $t('createButton') }}
        </BaseButton>
        <div class="!mt-3">
          <BaseMessageBlock
            v-if="
              uriAddress &&
              uriAddress !== web3Account &&
              !loadingTextRecord &&
              !pendingENSRecord
            "
            level="warning"
          >
            {{
              $t('setup.notControllerAddress', { wallet: shorten(uriAddress) })
            }}
          </BaseMessageBlock>
          <BaseMessageBlock
            v-else-if="debouncedShowPleaseWaitMessage && creatingSpace"
            level="info"
          >
            {{ $t('setup.pleaseWaitMessage') }}
          </BaseMessageBlock>
        </div>
      </div>
    </BaseBlock>
  </div>
  <teleport to="#modal">
    <ModalNetworks
      v-model="form.network"
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
    />
  </teleport>
</template>
