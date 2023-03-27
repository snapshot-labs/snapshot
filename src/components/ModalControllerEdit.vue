<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';

const {
  spaceControllerInput,
  settingENSRecord,
  spaceController,
  confirmSetRecord
} = useSpaceController();

defineProps<{
  open: boolean;
  ensAddress: string;
}>();

const controllerInputIsValid = computed(() =>
  isAddress(spaceControllerInput.value)
);

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('settings.editController') }}</h3>
      </div>
    </template>

    <div class="p-4">
      <BaseMessageBlock v-if="spaceController" level="info" class="mb-3">
        {{
          $tc('settings.currentSpaceControllerIs', {
            address: shorten(spaceController)
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
              spaceController ?? '0x3901D0fDe202aF1427216b79f5243f8A022d68cf'
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
        @click="confirmSetRecord(), $emit('close')"
      >
        {{ $t('settings.set') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
