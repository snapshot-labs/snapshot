<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { computed, ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['close', 'networkChanged']);
const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;
const networkData = {
  '1': {
    name: 'Mainnet',
    chainId: '0x1'
  },
  '4': {
    name: 'Rinkeby',
    chainId: '0x4'
  }
};

const { notify } = useFlashNotification();
const { t } = useI18n();

const usingMetaMask = computed(() => {
  return window.ethereum && getInstance().provider.value?.isMetaMask;
});

const switchingChain = ref(false);

const switchToDefaultNetwork = async () => {
  try {
    switchingChain.value = true;
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: networkData[defaultNetwork].chainId
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
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('unsupportedNetwork.unsupportedNetwork') }}</h3>
      </div>
    </template>

    <div class="space-y-4 m-4">
      <BaseMessage v-if="defaultNetwork === '1'" level="warning">
        {{
          $t('unsupportedNetwork.switchNetworkToNetwork', {
            network: 'Ethereum Mainnet'
          })
        }}
      </BaseMessage>
      <BaseMessage v-if="defaultNetwork === '4'" level="warning">
        {{
          $t('unsupportedNetwork.switchNetworkToNetwork', {
            network: 'Rinkeby Network'
          })
        }}
      </BaseMessage>
    </div>
    <div class="space-y-4 m-4"></div>
    <div class="m-4 space-y-2" v-if="usingMetaMask">
      <BaseButton
        :loading="switchingChain"
        class="w-full"
        primary
        @click="switchToDefaultNetwork"
      >
        {{
          $t('unsupportedNetwork.switchToNetwork', {
            network: networkData[defaultNetwork].name
          })
        }}
      </BaseButton>
      <div v-if="defaultNetwork === '1'">
        <BaseLink link="https://demo.snapshot.org" hide-external-icon>
          <BaseButton class="w-full">
            {{ $t('unsupportedNetwork.goToDemoSite') }}
          </BaseButton>
        </BaseLink>
      </div>
    </div>
  </BaseModal>
</template>
