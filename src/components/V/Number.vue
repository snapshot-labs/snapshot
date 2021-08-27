<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Number,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || undefined);

watch(input, () => emit('update:modelValue', parseFloat(input.value)));
</script>

<template>
  <label>{{ definition.title }}</label>
  <input type="number" v-model="input" />
  <legend v-if="definition.description" v-text="definition.description" />
</template>
