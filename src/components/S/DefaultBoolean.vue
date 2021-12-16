<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || undefined);

watch(input, () => emit('update:modelValue', input.value));
</script>

<template>
  <SBase :definition="definition">
    <input type="checkbox" v-model="input" />
  </SBase>
</template>
