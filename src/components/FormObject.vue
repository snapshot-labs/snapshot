<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useFormValidation } from '@/composables';

import * as FormObject from '@/components/FormObject.vue';
import FormArray from '@/components/FormArray.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';
import InputSwitch from '@/components/InputSwitch.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: any;
}>();

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const input = computed({
  get: () => props.modelValue || props.definition.default || {},
  set: value => {
    emit('update:modelValue', value);
  }
});

const getComponent = (type: string) => {
  switch (type) {
    case 'object':
      return FormObject;
    case 'array':
      return FormArray;
    case 'string':
      return InputString;
    case 'number':
      return InputNumber;
    case 'boolean':
      return InputSwitch;
    default:
      return null;
  }
};

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
      @update:is-valid="emit('update:isValid', $event)"
    />
  </div>
</template>
