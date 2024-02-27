<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';
import { onMounted, ref } from 'vue';
import Plugin from '../../index';
import { SafeModuleTransactionBatch } from '@/helpers/interfaces';
import { Network } from '../../types';
import { useStorage } from '@vueuse/core';

interface SafeDetails {
  connextAddress?: string;
  multiSendAddress: string;
  realityAddress?: string;
  umaAddress?: string;
  network: Network;
  hash: string | null;
  txs: SafeModuleTransactionBatch[];
  gnosisSafeAddress?: string;
}

type SafeSelectProps = {
  safes: SafeDetails[];
};

const props = defineProps<SafeSelectProps>();
const emits = defineEmits(['safeSelected']);
const safeList = useStorage<SafeDetails[]>('snapshot.safeList', []);
const loading = ref<boolean>(false);

const plugin = new Plugin();

onMounted(async () => {
  if (props.safes.length && props.safes.length !== safeList.value.length) {
    loading.value = true;
    const currentSafeList: SafeDetails[] = [];

    await Promise.all(
      props.safes.map(async safe => {
        const { realityAddress, umaAddress, network, connextAddress } = safe;
        if (connextAddress) {
          const { dao } = await plugin.getModuleDetailsConnext(
            network,
            connextAddress
          );
          currentSafeList.push({ ...safe, gnosisSafeAddress: dao });
        }
        if (umaAddress) {
          const { dao } = await plugin.getModuleDetailsUma(network, umaAddress);
          currentSafeList.push({ ...safe, gnosisSafeAddress: dao });
        }
        if (realityAddress) {
          const { dao } = await plugin.getModuleDetailsReality(
            network,
            realityAddress
          );
          currentSafeList.push({ ...safe, gnosisSafeAddress: dao });
        }
      })
    );
    safeList.value = currentSafeList;
    loading.value = false;
  }
});

const networkName = (network: string) => {
  if (network === '1') return 'Mainnet';
  const { name } = networks[network] || {};
  return name || `#${network}`;
};

const networkIcon = (network: string) => {
  const { logo } = networks[network];
  return getIpfsUrl(logo);
};

const handleSafeSelected = (safe: SafeDetails) => {
  emits('safeSelected', safe);
};
</script>

<template>
  <div class="safe-select-container mb-4 mt-2">
    <div v-if="loading">
      <LoadingSpinner class="m-2" />
    </div>
    <div v-else class="w-full">
      <div
        v-for="(safe, index) in safeList"
        class="safe-select-container-item"
        :key="safe.gnosisSafeAddress"
      >
        <div class="safe-select-item" @click="handleSafeSelected(safe)">
          <BaseAvatar
            class="float-left mr-2"
            :src="networkIcon(safe.network)"
            size="28"
          />
          {{ networkName(safe.network) }} Safe
          <p>
            {{ safe.gnosisSafeAddress ? shorten(safe.gnosisSafeAddress) : '' }}
          </p>
        </div>
        <div v-if="index < safeList.length - 1" class="divider"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.safe-select-container {
  display: flex;
  max-width: 273px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--block-bg);
  overflow: hidden;
}
.safe-select-container-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}
.loading-container {
  display: flex;
  justify-content: center;
}
.safe-select-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  gap: 8px;
  padding: 10px;
  position: relative;
  &:hover {
    background: var(--bg-color);
    filter: brightness(95%);
  }
  &:not(:last-child):after {
    content: '';
    position: absolute;
    left: 0px;
    bottom: 0;
    height: 1px;
    width: 100%;
    background-color: var(--border-color);
  }
}
</style>
