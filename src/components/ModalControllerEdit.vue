<script setup lang="ts">
import { computed } from 'vue';
import { useSpaceController } from '@/composables/useSpaceController';
import { shorten } from '@/helpers/utils';

const { spaceControllerInput, controllerInputIsValid, settingENSRecord } =
  useSpaceController();

const props = defineProps<{
  open: boolean;
  currentTextRecord: string;
  ensAddress: string;
}>();

const currentSpaceController = computed(() => {
  return props.currentTextRecord?.split('/')[4] ?? '';
});

defineEmits(['close', 'set']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('settings.editController') }}</h3>
      </div>
    </template>

    <div class="p-4">
      <BaseMessage level="info" class="mb-3">
        {{
          $tc('settings.currentSpaceControllerIs', {
            address: shorten(currentSpaceController)
          })
        }}
        <div>
          <BaseLink :link="`https://app.ens.domains/name/${ensAddress}`">
            {{ $t('setup.seeOnEns') }}
          </BaseLink>
        </div>
      </BaseMessage>

      {{ $t('settings.newController') }}

      <UiInput
        v-model.trim="spaceControllerInput"
        :placeholder="
          $t('setup.spaceOwnerAddressPlaceHolder', {
            address: currentSpaceController
          })
        "
        class="mt-1"
        focus-on-mount
      >
      </UiInput>
    </div>
    <template v-slot:footer>
      <BaseButton
        class="button-outline w-full my-2"
        primary
        :disabled="!controllerInputIsValid"
        @click="$emit('set'), $emit('close')"
        :loading="settingENSRecord"
      >
        {{ $t('settings.set') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
