<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: String,
  slim: Boolean
});

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-violet-600';
  if (props.state === 'active') return 'bg-green';
  return 'bg-gray-500';
});
</script>

<template>
  <span v-if="slim" :class="stateClass" class="State slim text-white" />
  <span
    v-else
    :class="stateClass"
    v-text="$t(`proposals.states.${state}`)"
    class="State text-white"
  />
</template>

<style scoped>
.State {
  font-size: 16px;
  height: 26px;
  vertical-align: middle;
  padding: 0 12px;
  border-radius: 14px;
  line-height: 24px;
}

.State.slim {
  padding: 0;
  height: 12px;
  width: 13px;
  border-radius: 50%;
  display: inline-block;
}
</style>
