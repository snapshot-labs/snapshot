<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: String
});

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-purple-600';
  if (props.state === 'active') return 'bg-green';
  return 'bg-gray-500';
});
</script>

<template>
  <div
    class="
      text-white text-sm
      h-[28px]
      leading-[28px]
      inline-block
      align-middle
      px-[12px]
      rounded-full
    "
    :class="stateClass"
  >
    {{ $t(`proposals.states.${state}`) }}
  </div>
</template>
