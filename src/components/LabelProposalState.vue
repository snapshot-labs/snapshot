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
    class="text-white rounded-full px-[12px] text-sm h-[24px] w-fit leading-[23px]"
    :class="stateClass"
  >
    {{ $t(`proposals.states.${state}`) }}
  </div>
</template>
