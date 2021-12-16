<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: String,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || undefined);

watch(input, () => emit('update:modelValue', input.value));
</script>

<template>
  <SBase :definition="definition">
    <input
      type="text"
      v-model="input"
      class="s-input mb-3"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
