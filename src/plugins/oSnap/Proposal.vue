<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import Config from './components/Config.vue';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
}>();
</script>

<template>
  <Config
    v-if="!!proposal.plugins.oSnap?.safe?.transactions?.length"
    :plugin-data="proposal.plugins.oSnap"
    :proposal="proposal"
    :is-proposal="true"
    :network="space.network"
    :space="space"
    :results="results"
  />
</template>
