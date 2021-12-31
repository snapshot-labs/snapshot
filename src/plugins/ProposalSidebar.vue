<script setup>
import ChainlinkProposalSidebar from './Chainlink/ProposalSidebar.vue';

const props = defineProps({
  proposal: Object,
  space: Object
});
</script>

<template>
  <ChainlinkProposalSidebar v-bind="props" />
</template>