<script setup lang="ts">
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { mapLegacyExecutionData } from './utils';
import {
  ExecutionData,
  SafeModuleLogos,
  SafeModuleType,
  ModuleExecutionData,
  Safe,
  EIP3770_PREFIXES
} from '@/helpers/safe';

const props = defineProps<{
  proposal: Proposal;
}>();

const executionData = computed<ExecutionData[]>(() =>
  mapLegacyExecutionData(props.proposal.plugins.safeSnap)
);

function safeLink(safe: Safe): string {
  const prefix = EIP3770_PREFIXES[safe.network];
  return `https://gnosis-safe.io/app/${prefix}:${safe.address}`;
}
</script>

<template>
  <div class="space-y-3">
    <BaseBlock
      v-for="(data, index) in executionData"
      :key="index"
      :title="`${data.safe.name} (${shorten(data.safe.address)})`"
      slim
    >
      <template #title-buttons>
        <div class="flex">
          <BaseLink
            :link="safeLink(data.safe)"
            target="_blank"
            hide-external-icon
          >
            <i-ho-external-link />
          </BaseLink>
          <img
            v-if="data.module"
            :src="SafeModuleLogos[data.module.type]"
            :alt="data.safe.type"
            class="ml-auto inline h-4"
          />
        </div>
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
            :execution-data-index="index"
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
