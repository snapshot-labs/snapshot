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
</script>

<template>
  <div class="space-y-3">
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

      <ExecutionDisplayTransactions :execution-data="data" />

      <div v-if="data.module" class="p-4 text-center">
        <Suspense>
          <ExecutionReality
            v-if="data.module.type === SafeModuleType.REALITY"
            :execution-data="(data as ModuleExecutionData)"
            :proposal="proposal"
          />
          <template #fallback>
            <LoadingSpinner />
          </template>
        </Suspense>
        <Suspense>
          <ExecutionUma
            v-if="data.module.type === SafeModuleType.UMA"
            :execution-data="(data as ModuleExecutionData)"
            :proposal="proposal"
          />
          <template #fallback>
            <LoadingSpinner />
          </template>
        </Suspense>
      </div>
      <ExecutionManual v-else :execution-data="data" />
    </BaseBlock>
  </div>
</template>
