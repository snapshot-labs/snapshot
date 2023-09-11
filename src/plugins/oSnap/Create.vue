<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import Config from './components/Config.vue';
import { OptimisticGovernorTransaction, TransactionBuilderModelValue } from './types';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  modelValue: { oSnap: TransactionBuilderModelValue } | undefined;
  results?: Results;
}>();

const emit = defineEmits<{
  update: [modelValue: { key: 'oSnap'; form: OptimisticGovernorTransaction[] }];
}>();
const update = (transactions: OptimisticGovernorTransaction[]) => {
  emit('update', { key: 'oSnap', form: transactions });
};
</script>

<template>
  <Config
    v-if="space.plugins.oSnap"
    :space="space"
    :results="results"
    :proposal="proposal"
    :preview="false"
    :model-value="modelValue?.oSnap || {}"
    @update:modelValue="update"
  />
</template>
