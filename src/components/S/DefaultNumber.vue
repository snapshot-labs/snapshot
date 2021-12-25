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
  <SBase :definition="definition">
    <input
      type="number"
      v-model="input"
      class="s-input mb-3"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
