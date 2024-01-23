<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  network?: string;
  showDemoButton?: boolean;
}>();
const emit = defineEmits(['close', 'networkChanged']);
const defaultNetwork = props.network || import.meta.env.VITE_DEFAULT_NETWORK;
const networkData = {
  '1': {
    name: 'Ethereum Mainnet',
    chainId: '0x1'
  },
  '5': {
    name: 'Goerli Testnet',
    chainId: '0x5'
  },
  '11155111': {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7'
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
  <TuneModal :open="open" hide-close @close="$emit('close')">
    <div class="pt-[40px] h-full">
      <div class="mx-4">
        <TuneModalIndicator variant="error" />

        <div class="my-[20px] text-center">
          <TuneModalTitle class="m-0 leading-6"> Wrong network </TuneModalTitle>
          <TuneModalDescription class="text-md leading-5 mt-1">
            To continue, you need to change the network in your wallet to
            <span class="font-semibold">{{
              networkData[defaultNetwork].name
            }}</span
            >.
          </TuneModalDescription>
        </div>
      </div>

      <div v-if="usingMetaMask" class="m-4 space-y-2">
        <TuneButton
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
        </TuneButton>
      </div>
      <div v-else-if="defaultNetwork === '1' && showDemoButton">
        <BaseLink link="https://testnet.snapshot.org" hide-external-icon>
          <TuneButton tabindex="-1" class="w-full">
            {{ $t('unsupportedNetwork.goToDemoSite') }}
          </TuneButton>
        </BaseLink>
      </div>
      <div v-else class="m-4">
        <TuneButton class="w-full" @click="$emit('close')"> Close </TuneButton>
      </div>
    </div>
  </TuneModal>
</template>
