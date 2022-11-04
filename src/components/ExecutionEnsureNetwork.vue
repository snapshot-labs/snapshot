<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useModal, useWeb3 } from '@/composables';

const props = defineProps<{
  network: string;
}>();

const { modalAccountOpen } = useModal();
const { web3, web3Account } = useWeb3();

const requiredNetwork = networks[props.network];
const isWrongNetwork = web3.value.network.chainId !== requiredNetwork.chainId;
</script>

<template>
  <BaseButton v-if="!web3Account" @click="modalAccountOpen = true">
    Connect wallet
  </BaseButton>
  <template v-else-if="isWrongNetwork">
    You are connected to the wrong network.<br />
    Please connect to: {{ requiredNetwork.name }} ({{
      requiredNetwork.chainId
    }}).
  </template>
  <slot v-else />
</template>
