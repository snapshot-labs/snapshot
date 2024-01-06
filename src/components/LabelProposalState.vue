<script setup lang="ts">
const props = defineProps<{
  state: string;
}>();

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-[#BB6BD9]';
  if (props.state === 'active') return 'bg-green';
  return 'bg-gray-500';
});
</script>

<template>
  <div
    class="text-white rounded-full px-[12px] text-[16px] h-[26px] w-fit"
    :class="stateClass"
  >
    {{ $t(`proposals.states.${state}`) }}
  </div>
</template>
