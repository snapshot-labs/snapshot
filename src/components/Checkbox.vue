<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

const input = ref(false);

function handleToggle() {
  input.value = !input.value;
  emit('update:modelValue', input.value);
}

if (props.modelValue) input.value = props.modelValue.toString();
</script>

<template>
  <a @click="handleToggle">
    <Icon
      :name="input ? 'toggle-on' : 'toggle_off'"
      :class="input ? 'text-green' : 'border-color'"
      size="32"
    />
  </a>
</template>
