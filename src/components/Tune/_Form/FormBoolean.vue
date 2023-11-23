<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  definition?: any;
}>();

const emit = defineEmits(['update:modelValue']);

onMounted(() => {
  emit(
    'update:modelValue',
    props.modelValue || props.definition?.default || false
  );
});
</script>

<template>
  <TuneSwitch
    v-bind="props"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
