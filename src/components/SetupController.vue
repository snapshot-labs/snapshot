<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

defineProps<{ web3Account: string }>();

const {
  spaceControllerInput,
  controllerInputIsValid,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  settingENSRecord,
  loadingTextRecord,
  setRecord,
  confirmSetRecord
} = useSpaceController();

async function handleSetRecord() {
  const tx = await setRecord();
  if (tx) {
    router.push({
      name: 'setup',
      params: {
        step: 'profile',
        ens: route.params.ens
      }
    });
  }
}
</script>

<template>
  <LoadingRow v-if="loadingTextRecord" block />
  <BaseBlock v-else :title="$t('setup.setSpaceController')">
    <UiInput
      v-model.trim="spaceControllerInput"
      :placeholder="$t('setup.spaceOwnerAddressPlaceHolder')"
      class="mt-2"
      focus-on-mount
    >
    </UiInput>
    <BaseButton
      class="button-outline w-full my-2"
      primary
      :disabled="!controllerInputIsValid"
      :loading="settingENSRecord"
      @click="confirmSetRecord"
    >
      {{ $t('setup.setController') }}
    </BaseButton>
  </BaseBlock>

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
