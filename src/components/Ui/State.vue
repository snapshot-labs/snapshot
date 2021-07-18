<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  state: String
});

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-purple';
  if (props.state === 'active') return 'bg-green';
  return '';
});
</script>

<template>
  <span
    :class="stateClass"
    v-text="$t(`proposals.states.${state}`)"
    class="State text-normal"
  />
</template>
