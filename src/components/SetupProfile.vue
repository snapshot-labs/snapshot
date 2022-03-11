<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { sleep, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { useValidationErrors } from '@/composables/useValidationErrors';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useClient } from '@/composables/useClient';
import { useI18n } from '@/composables/useI18n';
import { useRouter } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceController } from '@/composables/useSpaceController';
import { useApp } from '@/composables/useApp';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
  ensAddress: string;
  web3Account: string;
}>();

const notify = inject<any>('notify');
const router = useRouter();

const visitedFields = ref<string[]>([]);
const modalNetworksOpen = ref(false);
const creatingSpace = ref(false);

// Space setup form
const form = ref({
  name: '',
  symbol: '',
  network: '',
  // Adds connected wallet as admin so that the settings will show
  // in the sidebar after space creation
  admins: [props.web3Account],
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
const { pendingENSRecord } = useSpaceController();

const strategyValidationErrors = computed(
  () => validateSchema(schemas.space, form.value) ?? []
);

function errorIfVisited(field) {
  return visitedFields.value.includes(field)
    ? validationErrorMessage(field, strategyValidationErrors.value)
    : '';
}

const isValid = computed(() => {
  return strategyValidationErrors.value === true;
});

const { send } = useClient();

// Reactive local storage with help from vueuse package
const createdSpaces = useStorage(
  `snapshot.createdSpaces.${props.web3Account.slice(0, 8).toLowerCase()}`,
  {}
);

const { getExplore, explore } = useApp();
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

async function checkIfSpaceExists() {
  Promise.all([
    await getExplore(),
    await loadExtentedSpaces([props.ensAddress])
  ]);
  if (
    extentedSpaces.value.some(space => space.id === props.ensAddress) &&
    Object.keys(explore.value.spaces).some(
      spaceId => spaceId === props.ensAddress
    )
  ) {
    return;
  } else {
    await sleep(5000);
    await checkIfSpaceExists();
  }
}

const showPleaseWaitMessage = ref(false);
const debouncePleaseWaitMessage = useDebounceFn(() => {
  showPleaseWaitMessage.value = true;
}, 8000);

async function handleSubmit() {
  if (isValid.value) {
    creatingSpace.value = true;
    debouncePleaseWaitMessage();
    // Wait for ENS text-record transaction to confirm
    if (pendingENSRecord.value) {
      await sleep(3000);
      await handleSubmit();
    } else {
      // Create the space
      const result = await send(
        { id: props.ensAddress },
        'settings',
        form.value
      );
      if (result.id) {
        // Wait for the space to be available on the HUB
        await checkIfSpaceExists();
        creatingSpace.value = false;
        console.log('Result', result);
        // Save created space to local storage
        createdSpaces.value[props.ensAddress] = {
          showMessage: true
        };
        // Redirect to the new space page
        router.push({
          name: 'spaceProposals',
          params: {
            key: props.ensAddress
          }
        });
        notify(['green', t('notify.saved')]);
      } else {
        creatingSpace.value = false;
      }
    }
  } else {
    console.log('Invalid schema', strategyValidationErrors.value);
  }
}
</script>

<template>
  <div>
    <Block :title="$t('setup.setSpaceProfile')">
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
        <UiButton
          @click="handleSubmit"
          class="w-full !mt-3"
          primary
          :disabled="!isValid"
          :loading="creatingSpace"
        >
          {{ $t('createButton') }}
        </UiButton>
        <BaseMessageBlock
          v-if="showPleaseWaitMessage"
          level="info"
          class="!mt-[22px]"
        >
          <p class="mt-0 leading-5">
            {{ $t('setup.pleaseWaitMessage') }}
          </p>
        </BaseMessageBlock>
      </div>
    </Block>
  </div>
  <teleport to="#modal">
    <ModalNetworks
      v-model="form.network"
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
    />
  </teleport>
</template>
