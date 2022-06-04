<script setup lang="ts">
import { ref, watch } from 'vue';
import { useValidationErrors } from '@/composables/useValidationErrors';

import * as DefaultObject from '@/components/InputObject.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: any;
  errors: boolean | Record<string, any>[];
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || {});

const getComponent = name => {
  switch (name) {
    case 'object':
      return DefaultObject;
    case 'string':
      return InputString;
    case 'number':
      return InputNumber;
    default:
      return null;
  }
};

watch(input, () => emit('update:modelValue', input.value));

const { validationErrorMessage } = useValidationErrors();
</script>

<template>
  <div class="space-y-2">
    <component
      v-for="(property, key) in definition.properties"
      :key="key"
      :is="getComponent(property.type)"
      :definition="property"
      :error="validationErrorMessage(key, props.errors)"
      v-model="input[key]"
    />
  </div>
</template>
