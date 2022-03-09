<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { computed, ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useFlashNotification } from '../../composables/useFlashNotification';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['close', 'networkChanged']);

const { notify } = useFlashNotification();
const { t } = useI18n();

const usingMetaMask = computed(() => {
  return window.ethereum && getInstance().provider.value?.isMetaMask;
});

const switchingChain = ref(false);

const switchToMainnet = async () => {
  try {
    switchingChain.value = true;
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x1'
        }
      ]
    });
    await sleep(1000);
    switchingChain.value = false;
    emit('close');
    emit('networkChanged');
  } catch (e) {
    notify(['red', t('notify.somethingWentWrong')]);
    console.error(e);
    switchingChain.value = false;
  }
};
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('unsupportedNetwork.unsupportedNetwork') }}</h3>
      </div>
    </template>

    <div class="space-y-4 m-4">
      <p>
        {{ $t('unsupportedNetwork.ensOnlyMainnet') }}
      </p>
      <p>
        {{ $t('unsupportedNetwork.switchNetworkToMainnet') }}
      </p>
    </div>
    <template v-if="usingMetaMask" v-slot:footer>
      <UiButton
        :loading="switchingChain"
        class="button-outline w-full"
        :primary="true"
        @click="switchToMainnet"
      >
        {{ $t('unsupportedNetwork.switchToMainnet') }}
      </UiButton>
    </template>
  </UiModal>
</template>
