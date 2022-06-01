<script setup lang="ts">
import { ref, watch } from 'vue';
import { shorten } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import { useRouter, useRoute } from 'vue-router';
import { useClient } from '@/composables/useClient';

const { isGnosisSafe } = useClient();

const router = useRouter();
const route = useRoute();

const props = defineProps<{ web3Account: string }>();

const fillConnectedWallet = ref(true);

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

watch(
  () => [fillConnectedWallet.value, props.web3Account],
  () => {
    if (fillConnectedWallet.value)
      return (spaceControllerInput.value = props.web3Account);

    spaceControllerInput.value = '';
  },
  { immediate: true }
);
</script>

<template>
  <LoadingRow v-if="loadingTextRecord" block />
  <BaseBlock v-else :title="$t('setup.setSpaceController')">
    <div class="mb-4">
      <BaseMessageBlock level="info">
        {{ $t('setup.setSpaceControllerInfo') }}
      </BaseMessageBlock>
    </div>
    <div class="flex items-center gap-2">
      <BaseCheckbox v-model="fillConnectedWallet" />
      {{ $t('setup.fillCurrentAccount') }}
    </div>
    <UiInput
      v-model.trim="spaceControllerInput"
      :placeholder="
        $t('setup.spaceOwnerAddressPlaceHolder', { address: web3Account })
      "
      :readonly="fillConnectedWallet"
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

    <BaseMessageBlock
      v-if="isGnosisSafe && !fillConnectedWallet"
      level="warning"
    >
      <i18n-t keypath="setup.setSpaceControllerInfoGnosisSafe" tag="span">
        <template #link>
          <BaseLink link="https://docs.snapshot.org/spaces/create">
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </BaseMessageBlock>
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
