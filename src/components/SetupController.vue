<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useClient } from '@/composables/useClient';

const { isGnosisSafe } = useClient();

const router = useRouter();
const route = useRoute();

const props = defineProps<{ web3Account: string }>();

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

onMounted(() => {
  if (isGnosisSafe.value) spaceControllerInput.value = props.web3Account;
});
</script>

<template>
  <LoadingRow v-if="loadingTextRecord" block />
  <BaseBlock v-else :title="$t('setup.setSpaceController')">
    <BaseMessageBlock level="info" class="mb-4">
      {{ $t('setup.setSpaceControllerInfo') }}
      <span v-if="isGnosisSafe">
        {{ $t('setup.setSpaceControllerInfoGnosisSafe') }}
      </span>
    </BaseMessageBlock>
    <UiInput
      v-model.trim="spaceControllerInput"
      :placeholder="$t('setup.spaceOwnerAddressPlaceHolder')"
      :readonly="isGnosisSafe"
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
