<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import {
  sleep,
  validateSchema,
  clone
} from '@snapshot-labs/snapshot.js/src/utils';
import { useValidationErrors } from '@/composables/useValidationErrors';
import { useClient } from '@/composables/useClient';
import { useI18n } from '@/composables/useI18n';
import { useRouter, useRoute } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaceController } from '@/composables/useSpaceController';
import { refDebounced } from '@vueuse/core';
import { shorten, clearAvatarCache } from '@/helpers/utils';

const props = defineProps<{
  web3Account: string;
}>();

const notify = inject<any>('notify');
const router = useRouter();
const route = useRoute();

const creatingSpace = ref(false);

// Space setup form
const form = ref({
  name: '',
  about: '',
  symbol: '',
  avatar: '',
  network: '1',
  admins: [] as string[],
  categories: [],
  // Adds "ticket" strategy with VOTE symbol as default/placeholder strategy
  strategies: [
    {
      name: 'ticket',
      network: '1',
      params: {
        symbol: 'VOTE'
      }
    }
  ]
});

const { validationErrorMessage } = useValidationErrors();
const { t } = useI18n();
const { pendingENSRecord, loadingTextRecord, uriAddress, loadUriAddress } =
  useSpaceController();

const spaceValidation = computed(() => {
  const formattedForm = formatForm(form.value);

  return validateSchema(schemas.space, formattedForm) ?? [];
});

function getError(field) {
  return validationErrorMessage(field, spaceValidation.value);
}

const isValid = computed(() => {
  return spaceValidation.value === true;
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

function formatForm(form) {
  if (!form) return;
  const formattedForm = clone(form);
  const notRequiredFields = ['avatar', 'about', 'categories'];
  Object.entries(formattedForm).forEach(([key, value]) => {
    if (notRequiredFields.includes(key) && (value === null || value === ''))
      delete formattedForm[key];
  });
  return formattedForm;
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

    const formattedForm = formatForm(form.value);
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
</script>

<template>
  <div class="space-y-4">
    <BaseBlock :title="$t('setup.profile')">
      <div class="space-y-2">
        <div class="flex flex-col-reverse sm:flex-row">
          <div class="mt-3 space-y-2 sm:mt-0 sm:w-2/3">
            <BaseInput
              v-model="form.name"
              :title="$t(`spaceProfile.name.label`)"
              :error="getError('name')"
              :max-length="schemas.space.properties.name.maxLength"
              :placeholder="$t('spaceProfile.name.placeholder')"
              focus-on-mount
            />
            <LabelInput> {{ $t(`spaceProfile.about.label`) }} </LabelInput>
            <TextareaAutosize
              v-model="form.about"
              class="s-input !rounded-3xl"
              :max-length="schemas.space.properties.about.maxLength"
              :placeholder="$t('spaceProfile.about.placeholder')"
            />
            <ListboxMultipleCategories
              :categories="form.categories"
              @update-categories="value => (form.categories = value)"
            />
          </div>
          <div class="flex w-full justify-center sm:w-1/3">
            <div>
              <LabelInput>
                {{ $t('spaceProfile.avatar') }}
              </LabelInput>
              <InputUploadAvatar
                class="h-[80px]"
                @image-uploaded="url => (form.avatar = url)"
                @image-remove="form.avatar = ''"
              >
                <template #avatar="{ uploading, previewFile }">
                  <div class="relative">
                    <AvatarSpace
                      :preview-file="previewFile"
                      size="80"
                      :space="{ id: route.params.ens as string }"
                    />
                    <AvatarOverlayEdit :loading="uploading" />
                    <div
                      class="absolute right-0 bottom-[2px] rounded-full bg-skin-heading p-1"
                    >
                      <i-ho-pencil class="text-[12px] text-skin-bg" />
                    </div>
                  </div>
                </template>
              </InputUploadAvatar>
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>

    <StrategiesBlock
      :network="form.network"
      :symbol="form.symbol"
      :strategies="form.strategies"
      :get-error="getError"
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
