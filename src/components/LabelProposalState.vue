<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    state: string;
    slim?: boolean;
  }>(),
  {
    slim: false
  }
);

const stateClass = computed(() => {
  if (props.state === 'closed') return 'bg-[#BB6BD9]';
  if (props.state === 'active') return 'bg-green';
  return 'bg-gray-500';
});
</script>

<template>
  <span v-if="slim" :class="stateClass" class="State slim text-white" />
  <span
    v-else
    :class="stateClass"
    class="State text-white"
    v-text="$t(`proposals.states.${state}`)"
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
