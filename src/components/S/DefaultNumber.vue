<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: number;
  definition: any;
  error: string;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default);

watch(input, () => emit('update:modelValue', Number(input.value)));
</script>

<template>
  <SBase :definition="definition" :input="input" :error="error">
    <input
      type="number"
      v-model="input"
      :class="['s-input', { '!border-red': error }]"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
