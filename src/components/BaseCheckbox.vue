<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

function handleToggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <a @click="handleToggle" class="flex">
    <BaseIcon
      :name="modelValue ? 'toggle-on' : 'toggle_off'"
      :class="modelValue ? 'text-green' : 'text-skin-border'"
      size="32"
    />
  </a>
</template>
