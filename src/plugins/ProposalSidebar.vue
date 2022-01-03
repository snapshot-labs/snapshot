<script setup>
import ChainlinkProposalSidebar from './Chainlink/ProposalSidebar.vue';

const props = defineProps({
  proposal: Object,
  space: Object
});
</script>

<template>
  <template v-if="proposal.plugins">
    <ChainlinkProposalSidebar v-bind="props" />
  </template>>
</template>