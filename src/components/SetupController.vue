<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  ownedEnsDomains: { name: string }[];
}>();

const {
  spaceControllerInput,
  controllerInputIsValid,
  settingENSRecord,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  ensAddress,
  setRecord,
  confirmSetRecord
} = useSpaceController();

async function handleSetRecord() {
  const receipt = await setRecord();
  if (receipt) {
    router.push({
      name: 'spaceSettings',
      params: {
        key: ensAddress.value
      }
    });
  }
}
</script>

<template>
  <Block :title="$t('setup.setSpaceController')">
    <UiInput
      v-model.trim="spaceControllerInput"
      :placeholder="$t('setup.spaceOwnerAddressPlaceHolder')"
      class="mt-2"
      focus-on-mount
    >
    </UiInput>
    <UiButton
      class="button-outline w-full my-2"
      primary
      :disabled="!controllerInputIsValid"
      @click="confirmSetRecord"
      :loading="settingENSRecord"
    >
      {{ $t('setup.setController') }}
    </UiButton>
  </Block>

  <teleport to="#modal">
    <ModalUnsupportedNetwork
      :open="modalUnsupportedNetworkOpen"
      @close="modalUnsupportedNetworkOpen = false"
      @networkChanged="modalConfirmSetTextRecordOpen = true"
    />
    <ModalConfirmAction
      :open="modalConfirmSetTextRecordOpen"
      @close="modalConfirmSetTextRecordOpen = false"
      @confirm="handleSetRecord"
    >
      <div class="space-y-4 m-4 text-skin-link">
        <p>
          {{ $t('setup.explainControllerAndEns') }}
        </p>
        <p>
          {{
            $t('setup.confirmToSetAddress', {
              address: shorten(spaceControllerInput)
            })
          }}
          {{ $t('setup.controllerHasAuthority') + '.' }}
        </p>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
