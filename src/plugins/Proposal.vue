<script setup>
import ChainlinkProposal from './Chainlink/Proposal.vue';

const props = defineProps({
  proposal: Object,
  space: Object
});
</script>

<template>
  <ChainlinkProposal v-bind="props" />
</template>