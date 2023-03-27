<script setup lang="ts">
import * as FormObject from '@/components/FormObject.vue';
import FormArray from '@/components/FormArray.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';
import InputSwitch from '@/components/InputSwitch.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: any;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || {});

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

watch(input, () => emit('update:modelValue', input.value), { deep: true });

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
