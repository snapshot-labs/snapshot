<script setup lang="ts">
import { ref, watch } from 'vue';
import { shorten, explorerUrl } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import { useClient, useSpaceController, useWeb3 } from '@/composables';

const emit = defineEmits(['next']);

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;
const { isGnosisSafe } = useClient();

const { web3Account } = useWeb3();

const fillConnectedWallet = ref(true);
const isEditController = ref(false);

const {
  spaceControllerInput,
  controllerInputIsValid,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  settingENSRecord,
  loadingTextRecord,
  setRecord,
  confirmSetRecord,
  ensAddress,
  textRecord,
  uriAddress
} = useSpaceController();

async function handleSetRecord() {
  const tx = await setRecord();
  if (tx) {
    emit('next');
  }
}

watch(
  () => [fillConnectedWallet.value, web3Account.value],
  () => {
    if (fillConnectedWallet.value)
      return (spaceControllerInput.value = web3Account.value);

    spaceControllerInput.value = '';
  },
  { immediate: true }
);
</script>

<template>
  <LoadingRow v-if="loadingTextRecord" block />
  <div v-else-if="uriAddress && !isEditController">
    <BaseMessageBlock level="info" is-responsive>
      {{ $t('setup.setSpaceControllerExists') }}

      <BaseLink :link="`https://app.ens.domains/name/${ensAddress}`">
        {{ $t('setup.seeOnEns') }}
      </BaseLink>
    </BaseMessageBlock>
    <div class="mt-4 flex items-center justify-between px-4 md:px-0">
      <BaseButton @click="isEditController = true">
        {{ $t('edit') }}
      </BaseButton>
      <SetupButtonNext class="!mt-0" @click="emit('next')" />
    </div>
  </div>
  <div v-else>
    <BaseBlock :title="$t('setup.setSpaceController')">
      <div class="mb-4">
        <BaseMessageBlock level="info">
          {{ $t('setup.setSpaceControllerInfo') }}
        </BaseMessageBlock>
      </div>

      <BaseInput
        v-model.trim="spaceControllerInput"
        title="Controller address"
        :placeholder="
          $t('setup.spaceOwnerAddressPlaceHolder', { address: web3Account })
        "
        :readonly="fillConnectedWallet"
        focus-on-mount
        @keyup.delete="fillConnectedWallet = false"
      />
      <div class="mt-1 flex items-center gap-2">
        <BaseSwitch v-model="fillConnectedWallet" />
        {{ $t('setup.fillCurrentAccount') }}
      </div>
      <BaseButton
        class="mt-4 w-full"
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
        <i18n-t
          keypath="setup.setSpaceControllerInfoGnosisSafe"
          tag="span"
          scope="global"
        >
          <template #link>
            <BaseLink link="https://docs.snapshot.org/spaces/create">
              {{ $t('learnMore') }}
            </BaseLink>
          </template>
        </i18n-t>
      </BaseMessageBlock>
    </BaseBlock>
    <SetupButtonNext
      v-if="isEditController"
      class="!mt-4 mr-4 md:mr-0"
      text="skip"
      @click="emit('next')"
    />
  </div>

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
      <div class="m-4 mt-0 space-y-1 text-skin-text">
        <BaseMessageBlock level="info" class="mb-3">
          {{
            $t('setup.explainControllerAndEns', {
              network: networks[defaultNetwork].name
            })
          }}
        </BaseMessageBlock>
        <div class="flex justify-between">
          <span>ENS address</span>
          <BaseLink :link="`https://app.ens.domains/name/${ensAddress}`">
            <span>{{ ensAddress }}</span>
          </BaseLink>
        </div>
        <div class="flex justify-between">
          <span>Controller</span>
          <BaseLink :link="explorerUrl(defaultNetwork, spaceControllerInput)">
            <span>{{ shorten(spaceControllerInput) }}</span>
          </BaseLink>
        </div>
        <div class="flex justify-between pb-2">
          <span class="mr-3 whitespace-nowrap">Text record</span>
          <span
            v-tippy="{ content: textRecord }"
            class="truncate text-skin-link"
            >{{ textRecord }}</span
          >
        </div>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
