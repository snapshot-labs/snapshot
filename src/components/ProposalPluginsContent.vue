<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  space: Object,
  proposal: Object,
  loadedResults: Boolean
});

const emit = defineEmits(['update:safeSnapInput']);

const safeSnapInput = computed({
  get: () => props.proposal.plugins.safeSnap,
  set: value => emit('update:safeSnapInput', value)
});
</script>

<template>
  <div>
    <PluginSafeSnapConfig
      v-if="loadedResults && proposal.plugins?.safeSnap?.txs"
      v-model="safeSnapInput"
      :proposalId="id"
      :proposal="proposal"
      :network="space.network"
      :preview="true"
      :moduleAddress="space.plugins?.safeSnap?.address"
    />
  </div>
</template>
