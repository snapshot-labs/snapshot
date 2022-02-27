<script setup lang="ts">
import { ref, watch } from 'vue';
import { useValidationErrors } from '@/composables/useValidationErrors';

import * as DefaultObject from './DefaultObject.vue';
import DefaultArray from './DefaultArray.vue';
import DefaultString from './DefaultString.vue';
import DefaultNumber from './DefaultNumber.vue';
import DefaultBoolean from './DefaultBoolean.vue';

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
    case 'array':
      return DefaultArray;
    case 'string':
      return DefaultString;
    case 'number':
      return DefaultNumber;
    case 'boolean':
      return DefaultBoolean;
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
