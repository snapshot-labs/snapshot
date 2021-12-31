<script setup>
defineProps({
  proposal: Object
});
</script>

<template>
  <Block v-if="proposal.plugins?.Chainlink">
    <div>Chainlink transaction data:</div>
    {{ proposal.plugins.Chainlink }}
  </Block>
</template>