<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: String,
  slim: Boolean
});

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-purple-600';
  if (props.state === 'active') return 'bg-green';
  return 'bg-gray-500';
});
</script>

<template>
  <span v-if="slim" :class="stateClass" class="State text-white slim" />
  <span
    v-else
    :class="stateClass"
    v-text="$t(`proposals.states.${state}`)"
    class="State text-white"
  />
</template>
