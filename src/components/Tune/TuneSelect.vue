<script setup lang="ts">
type Item = {
  label: string;
  value: string | number;
};

defineProps<{
  items: Item[];
  modelValue: string | number;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

function handleChange(event: any) {
  emit('update:modelValue', event.target.value);
}
</script>

<template>
  <select
    :disabled="disabled"
    :value="modelValue"
    :class="['tune-select form-select', { disabled: disabled }]"
    @change="handleChange($event)"
  >
    <option v-for="(item, index) in items" :key="index" :value="item.value">
      {{ item.label }}
    </option>
  </select>
</template>
