<script setup lang="ts">
import { computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { mapLegacyExecutionData } from './utils';
import {
  ExecutionData,
  SafeModuleType,
  ModuleExecutionData
} from '@/helpers/safe';
import RealityExecution from './components/RealityExecution.vue';
import UmaExecution from './components/UmaExecution.vue';
import ManualExecution from './components/ManualExecution.vue';

const props = defineProps<{
  proposal: Proposal;
}>();

const executionData = computed<ExecutionData[]>(() =>
  mapLegacyExecutionData(props.proposal.plugins.safeSnap)
);
</script>

<template>
  <BaseBlock
    v-for="(data, index) in executionData"
    :key="index"
    :title="data.safe.name"
  >
    <div v-if="data.module">
      <RealityExecution
        v-if="data.module.type === SafeModuleType.REALITY"
        :execution-data="(data as ModuleExecutionData)"
        :proposal-id="proposal.id"
      />
      <UmaExecution
        v-if="data.module.type === SafeModuleType.UMA"
        :execution-data="(data as ModuleExecutionData)"
        :proposal-id="proposal.id"
      />
    </div>
    <ManualExecution v-else />
  </BaseBlock>
</template>
