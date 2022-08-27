<script setup lang="ts">
import { computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { mapLegacyExecutionData } from './utils';
import { ExecutionData } from '@/helpers/safe';

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
    slim
  >
    {{ data }}
  </BaseBlock>
</template>
