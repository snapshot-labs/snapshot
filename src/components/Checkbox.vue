<script setup>
const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

function handleToggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <a @click="handleToggle">
    <Icon
      :name="modelValue ? 'toggle-on' : 'toggle_off'"
      :class="modelValue ? 'text-green' : 'border-color'"
      size="32"
    />
  </a>
</template>
