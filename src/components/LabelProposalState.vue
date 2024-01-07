<script setup lang="ts">
const props = defineProps<{
  state: string;
  outlined?: boolean;
}>();

const commonStyles = {
  outlined: 'leading-[22px]',
  default: 'leading-[23px]'
};

const classesMap = {
  pending: {
    outlined: 'border border-gray-500/40 text-gray-500',
    default: 'bg-gray-500 text-white'
  },
  closed: {
    outlined: 'border border-red/40 text-red',
    default: 'bg-red text-white'
  },
  active: {
    outlined: 'border border-green/40 text-green',
    default: 'bg-green text-white'
  }
};

const stateClass = computed(() => {
  const style =
    classesMap[props.state][props.outlined ? 'outlined' : 'default'];
  const common = commonStyles[props.outlined ? 'outlined' : 'default'];

  return `${common} ${style}`;
});
</script>

<template>
  <div
    class="rounded-full px-[12px] text-sm h-[24px] w-fit"
    :class="stateClass"
  >
    {{ $t(`proposals.states.${state}`) }}
  </div>
</template>
