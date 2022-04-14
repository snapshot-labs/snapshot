<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: string[];
  definition: any;
  error: string;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || []);

onMounted(() => emit('update:modelValue', input.value));

watch(input, () => emit('update:modelValue', input.value));

function addItem() {
  input.value.push('');
}
</script>

<!-- TODO: Fix template -->
<template>
  <div v-for="(item, i) in input" :key="i">
    <SBaseInput :definition="{ title: '' }" v-model="input[i]" :error="error" />
  </div>
  <a @click="addItem">Add</a>
</template>
