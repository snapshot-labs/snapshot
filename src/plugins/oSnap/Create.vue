<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import Config from './components/Config.vue';
import { initialPluginData } from './constants';
import { OsnapModelValue, OsnapPluginData } from './types';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  modelValue: OsnapModelValue;
  results?: Results;
}>();

const emit = defineEmits<{
  'update': [value: { key: 'oSnap'; form: OsnapPluginData }];
}>();

const update = (newPluginData: OsnapPluginData) => {
  emit('update', { key: 'oSnap', form: newPluginData });
};
</script>

<template>
  <Config
    v-if="space.plugins.oSnap"
    :space="space"
    :results="results"
    :proposal="proposal"
    :is-proposal="false"
    :plugin-data="modelValue?.oSnap ?? initialPluginData"
    @update="update"
  />
</template>
