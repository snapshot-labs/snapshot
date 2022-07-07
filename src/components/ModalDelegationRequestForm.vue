<script setup lang="ts">
import { watch, ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useAliasAction } from '@/composables/useAliasAction';
import client from '@/helpers/clientEIP712';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useI18n } from '@/composables/useI18n';
import { useProfiles } from '@/composables/useProfiles';
import { clearStampCache } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';

const props = defineProps<{
  address: string;
  space: string;
  open: boolean;
}>();

const emit = defineEmits(['close']);

const { notify } = useFlashNotification();
const { send } = useClient();
const { t } = useI18n();
const modalDateSelectOpen = ref(false);

const properties = schemas.profile.properties;

const form = ref({
  // space: '',
  iam: 'delegate',
  title: '',
  description: '',
  rewardPriceOffer: 'None',
  maxReward: '',
  expires: 0
});

const setDate = input => {
  form.value.expires = input;
};

const changeIAM = input => {
  console.log(input);
  form.value.iam = input;
};

async function save() {
  if (!form.value.title || !form.value.description) {
    notify(['red', "You can't save a request without a title or description"]);
    return;
  }
  try {
    await send(props.space, 'newDelegationRequest', {
      space: props.space,
      iam: form.value.iam,
      title: form.value.title,
      description: form.value.description,
      rewardPriceOffer: form.value.rewardPriceOffer,
      maxReward: form.value.maxReward,
      expires: form.value.expires
    });
    emit('close');
    return notify(['green', t('notify.saved')]);
  } catch (error) {
    console.log('error', error);
    emit('close');
    return notify(['red', 'Something went wrong']);
  }
}

// watch(() => props.open, { immediate: true });
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>Add delegation request</h3>
      </div>
    </template>
    <div class="mt-2 flex justify-between px-4">
      <BaseButton
        class="mr-2 w-full"
        :primary="form.iam === 'delegate' ? true : false"
        @click="changeIAM('delegate')"
      >
        I'm Delegate
      </BaseButton>
      <BaseButton
        class="w-full"
        :primary="form.iam === 'delegator' ? true : false"
        @click="changeIAM('delegator')"
      >
        I'm Delegator
      </BaseButton>
    </div>
    <div class="space-y-2 p-4 pb-0">
      <BaseInput
        v-model="form.title"
        title="Title"
        type="text"
        placeholder="Enter a title"
        :max-length="properties.name.maxLength"
        focus-on-mount
      />
      <div>
        <LabelInput> Description </LabelInput>
        <TextareaAutosize
          v-model="form.description"
          class="s-input !rounded-3xl"
          :max-length="properties.about.maxLength"
          :placeholder="$t('profile.settings.bioPlaceholder')"
        />
      </div>
      <div>
        <LabelInput> Expires: </LabelInput>
        <UiInput
          class="mb-0 cursor-pointer md:mb-2"
          @click="modalDateSelectOpen = true"
        >
          <template #selected>
            <span
              v-text="
                form.expires > 0
                  ? $d(form.expires * 1e3, 'short', 'en-US')
                  : 'Never'
              "
            />
          </template>
          <template #info>
            <BaseIcon
              name="calendar"
              size="18"
              class="flex items-center text-skin-text"
            />
          </template>
        </UiInput>
      </div>
    </div>
    <div class="p-4">
      <BaseButton class="w-full" primary @click="save">
        {{ $t('save') }}
      </BaseButton>
    </div>
  </BaseModal>
  <teleport to="#modal">
    <ModalSelectDate
      selected-date="end"
      :open="modalDateSelectOpen"
      @close="modalDateSelectOpen = false"
      @input="setDate"
    />
  </teleport>
</template>
