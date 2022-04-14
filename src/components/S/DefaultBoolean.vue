<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
  definition: any;
  error: string;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default);

watch(input, () => emit('update:modelValue', input.value));
</script>

<!-- TODO: add template -->
<template>
  <div></div>
</template>
