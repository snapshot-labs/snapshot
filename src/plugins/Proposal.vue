<script setup>
import SafeSnapProposal from './safeSnap/Proposal.vue';

const props = defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Object
});
</script>

<template>
  <template v-if="proposal.plugins">
    <SafeSnapProposal v-bind="props" />
  </template>
</template>