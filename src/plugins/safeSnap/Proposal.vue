<script setup lang="ts">
import { computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { mapLegacyExecutionData } from './utils';
import {
  ExecutionData,
  SafeModuleLogos,
  SafeModuleType,
  ModuleExecutionData
} from '@/helpers/safe';

const props = defineProps<{
  proposal: Proposal;
}>();

const executionData = computed<ExecutionData[]>(() =>
  mapLegacyExecutionData(props.proposal.plugins.safeSnap)
);

const hasProposalEnded = computed<boolean>(() => {
  const now = new Date().getTime() / 1e3;
  return now > props.proposal.end;
});
</script>

<template>
  <BaseBlock
    v-for="(data, index) in executionData"
    :key="index"
    :title="data.safe.name"
    slim
  >
    <template #title-buttons>
      <img
        v-if="data.module"
        :src="SafeModuleLogos[data.module.type]"
        :alt="data.safe.type"
        class="inline h-4"
      />
    </template>

    <div v-if="data.module">
      <ExecutionReality
        v-if="data.module.type === SafeModuleType.REALITY"
        :execution-data="(data as ModuleExecutionData)"
        :proposal-id="proposal.id"
        :proposal-snapshot="proposal.snapshot"
        :has-proposal-ended="hasProposalEnded"
      />
      <ExecutionUma
        v-if="data.module.type === SafeModuleType.UMA"
        :execution-data="(data as ModuleExecutionData)"
        :proposal-id="proposal.id"
        :has-proposal-ended="hasProposalEnded"
      />
      <ExecutionTellor
        v-if="data.module.type === SafeModuleType.TELLOR"
        :execution-data="(data as ModuleExecutionData)"
        :proposal-id="proposal.id"
        :has-proposal-ended="hasProposalEnded"
      />
    </div>
    <ExecutionManual
      v-else
      :execution-data="data"
      :has-proposal-ended="hasProposalEnded"
    />
  </BaseBlock>
</template>
