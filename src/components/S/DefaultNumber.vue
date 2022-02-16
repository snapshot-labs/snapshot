<script setup>
import { ref, watch, computed } from 'vue';
import { useValidationErrors } from '@/composables/useValidationErrors';

const props = defineProps({
  modelValue: Number,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || undefined);

watch(input, () => emit('update:modelValue', parseFloat(input.value)));

const showError = ref(false);

const { getValidationErrors } = useValidationErrors();

const error = computed(() => {
  if (showError.value) {
    return getValidationErrors(props.definition, input.value);
  }
  return '';
});
</script>

<template>
  <SBase :definition="definition" :error="error">
    <input
      type="number"
      v-model="input"
      class="s-input"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
