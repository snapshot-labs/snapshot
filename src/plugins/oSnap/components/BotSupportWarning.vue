<script setup lang="ts">
import { Network, SpaceConfigResponse } from '../types';
import { onMounted } from 'vue';
import { isConfigCompliant } from '../utils';

const props = defineProps<{
  safeAddress: string;
  chainId: Network;
}>();

const configStatus = ref<SpaceConfigResponse>();

async function getConfigStatus() {
  try {
    const res = await isConfigCompliant(props.safeAddress, props.chainId);
    configStatus.value = res;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getConfigStatus());
watch([props.chainId, props.safeAddress], getConfigStatus);
</script>

<template>
  <div v-if="configStatus">
    <div v-if="configStatus.automaticExecution">
      <p class="text-green/75 text-sm">
        <BaseIcon name="warning" class="mr-1 text-sm text-inherit" />
        Warning! You are using the default settings. If your proposal passes,
        your transaction will be <strong>automatically executed</strong> and
        verified by the UMA Optimistic Oracle.
      </p>
    </div>

    <div v-else class="text-red/75 text-sm">
      <p>
        <BaseIcon name="warning" class="mr-1" />
        Warning! You are <strong>not</strong> using the default settings. If
        your proposal passes, you will be required to <strong>manually</strong>
        request transaction execution and post a bond to the UMA Optimistic
        Oracle for verification.
      </p>
      <p class="mt-2">Reasons:</p>
      <ul class="pl-4 [&>li]:list-disc">
        <li v-if="!configStatus.bondAmount">Bond Amount (Should be 2)</li>
        <li v-if="!configStatus.bondToken">Bond Token (Should be WETH)</li>
        <li v-if="!configStatus.rules">
          Space URL (only snapshot.org <strong>production</strong> spaces are
          supported with automated execution. There is no bot support for
          testnets.)
        </li>
      </ul>
    </div>
  </div>
</template>
