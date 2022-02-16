<script setup>
import { ref, watch, computed } from 'vue';
import { useValidationErrors } from '@/composables/useValidationErrors';

const props = defineProps({
  modelValue: String,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || undefined);

const showError = ref(false);

watch(input, () => {
  showError.value = true;
  emit('update:modelValue', input.value);
});

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
      type="text"
      v-model="input"
      class="s-input"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
