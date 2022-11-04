<script setup lang="ts">
import { computed } from 'vue';
import { useTimestamp } from '@vueuse/core';
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

const isProposalStillActive = computed(
  () =>
    useTimestamp({ offset: 0, interval: 1000 }).value / 1000 <=
    props.proposal.end
);
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

      <div class="p-4 text-center">
        <template v-if="isProposalStillActive">
          Execution will be possible after the proposal has ended.
        </template>
        <template v-else-if="data.module">
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
        </template>
        <ExecutionManual v-else :execution-data="data" />
      </div>
    </BaseBlock>
  </div>
</template>
