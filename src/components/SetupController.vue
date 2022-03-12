<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useSpaceController } from '@/composables/useSpaceController';
import { useRouter, useRoute } from 'vue-router';
import { getSpaceUri } from '@snapshot-labs/snapshot.js/src/utils';

const router = useRouter();
const route = useRoute();

const props = defineProps<{ ensAddress: string; web3Account: string }>();

const {
  spaceControllerInput,
  controllerInputIsValid,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  settingENSRecord,
  setRecord,
  confirmSetRecord
} = useSpaceController();

async function handleSetRecord() {
  const tx = await setRecord();
  if (tx) {
    router.push({
      name: 'setup',
      params: {
        step: 'profile'
      }
    });
  }
}

// Checks if a text-record with the connected wallet address exists
// and skips to step 3 if it does
const loadingTextRecord = ref(false);
onMounted(async () => {
  try {
    loadingTextRecord.value = true;
    const uri = await getSpaceUri(
      props.ensAddress,
      import.meta.env.VITE_DEFAULT_NETWORK
    );
    console.log('URI', uri);
    const uriAddress = uri?.split('/')[4] ?? '';
    if (
      uriAddress === props.web3Account &&
      route.params.step === 'controller'
    ) {
      router.push({ name: 'setup', params: { step: 'profile' } });
    }
    loadingTextRecord.value = false;
  } catch (e) {
    console.log(e);
    loadingTextRecord.value = false;
  }
});
</script>

<template>
  <Block v-if="loadingTextRecord" slim>
    <RowLoading class="my-2" />
  </Block>
  <Block v-else :title="$t('setup.setSpaceController')">
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
      :loading="settingENSRecord"
      @click="confirmSetRecord"
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
