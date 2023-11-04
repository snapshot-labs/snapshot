<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';
import { useConnect } from 'use-wagmi';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['connect', 'close']);

const { connectors } = useConnect();

function getWalletIcons(id) {
  switch (id) {
    case 'injected':
      return 'ipfs://QmTE7VPXMhriKAobMWEiC5S3oG22p4G6AXGyGdNWQTQ3Fv';
    case 'coinbaseWallet':
      return 'ipfs://QmbJKEaeMz6qR3DmJSTxtYtrZeQPptVfnnYK72QBsvAw5q';
    case 'walletConnect':
      return 'ipfs://QmZRVqHpgRemw13aoovP2EaQdVtjzXRaQGQZsCLXWaNn9x';
    case 'safe':
      return 'ipfs://QmfJUHZLtRvadM7fvEJUWWxhS869KXXCMxPCr7TUqkwvUc';

    default:
      return 'ipfs://QmXUov1JMszHkizCf3HvmcKWKm9PrG2KHpd5bDnE5YbZN8';
  }
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>
        {{ $t('connectWallet') }}
      </h3>
    </template>
    <div class="m-4 space-y-2">
      <template v-for="connector in connectors" :key="connector.id">
        <BaseButton
          v-if="connector.ready"
          class="flex w-full items-center justify-center"
          data-testid="button-connnect-wallet-injected"
          @click="emit('connect', connector)"
        >
          <img
            :src="getIpfsUrl(getWalletIcons(connector.id))"
            height="28"
            width="28"
            class="-mt-1 mr-2"
            :alt="connector.name"
          />
          {{ connector.name }}
        </BaseButton>
      </template>
    </div>
  </BaseModal>
</template>
