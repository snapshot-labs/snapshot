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
  if (!props.currentTextRecord) return null;
  const position = props.currentTextRecord.includes('/testnet/') ? 5 : 4;
  return props.currentTextRecord?.split('/')[position] ?? '';
});

defineEmits(['close', 'set']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('settings.editController') }}</h3>
      </div>
    </template>

    <div class="p-4">
      <BaseMessageBlock v-if="currentSpaceController" level="info" class="mb-3">
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
      </BaseMessageBlock>

      <BaseInput
        v-model.trim="spaceControllerInput"
        :title="$t('settings.newController')"
        :placeholder="
          $t('setup.spaceOwnerAddressPlaceHolder', {
            address:
              currentSpaceController ??
              '0x3901D0fDe202aF1427216b79f5243f8A022d68cf'
          })
        "
        focus-on-mount
      >
      </BaseInput>
    </div>
    <template #footer>
      <BaseButton
        class="my-2 w-full"
        primary
        :disabled="!controllerInputIsValid"
        :loading="settingENSRecord"
        @click="$emit('set'), $emit('close')"
      >
        {{ $t('settings.set') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
