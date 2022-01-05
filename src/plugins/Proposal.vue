<script setup>
import SafeSnapProposal from './safeSnap/Proposal.vue';

const props = defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Object
});
</script>

<template>
  <SafeSnapProposal v-bind="props" />
</template>