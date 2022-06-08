<script setup lang="ts">
import { ref, watch } from 'vue';
import { shorten, explorerUrl } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useRouter, useRoute } from 'vue-router';
import { useClient } from '@/composables/useClient';

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;
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
  confirmSetRecord,
  ensAddress,
  textRecord
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
      <BaseMessage level="info">
        {{ $t('setup.setSpaceControllerInfo') }}
      </BaseMessage>
    </div>

    <BaseInput
      title="Controller address"
      v-model.trim="spaceControllerInput"
      :placeholder="
        $t('setup.spaceOwnerAddressPlaceHolder', { address: web3Account })
      "
      :readonly="fillConnectedWallet"
      @keyup.delete="fillConnectedWallet = false"
      focus-on-mount
    />
    <div class="flex items-center gap-2">
      <BaseCheckbox v-model="fillConnectedWallet" />
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

    <BaseMessage v-if="isGnosisSafe && !fillConnectedWallet" level="warning">
      <i18n-t keypath="setup.setSpaceControllerInfoGnosisSafe" tag="span">
        <template #link>
          <BaseLink link="https://docs.snapshot.org/spaces/create">
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </BaseMessage>
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
      <div class="m-4 space-y-1 text-skin-text">
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
            class="truncate text-skin-link"
            v-tippy="{ content: textRecord }"
            >{{ textRecord }}</span
          >
        </div>
        <BaseMessage level="info">
          {{
            $t('setup.explainControllerAndEns', {
              network: networks[defaultNetwork].name
            })
          }}
        </BaseMessage>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
