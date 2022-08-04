<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useFormValidation } from '@/composables';

import * as DefaultObject from '@/components/InputObject.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: any;
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

const { modelValue } = toRefs(props);
const { getValidationMessage } = useFormValidation(
  props.definition,
  modelValue
);
</script>

<template>
  <div class="space-y-2">
    <component
      :is="getComponent(property.type)"
      v-for="(property, key) in (definition.properties as Record<string, any>)"
      :key="key"
      v-model="input[key]"
      :definition="property"
      :error="{ message: getValidationMessage(key) }"
    />
  </div>
</template>
