<script setup>
import { ref, watch } from 'vue';

import DefaultObject from './DefaultObject.vue';
import DefaultArray from './DefaultArray.vue';
import DefaultString from './DefaultString.vue';
import DefaultNumber from './DefaultNumber.vue';
import DefaultBoolean from './DefaultBoolean.vue';

const props = defineProps({
  modelValue: Object,
  definition: Object
});

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
</script>

<template>
  <component
    v-for="(property, i) in definition.properties"
    :key="i"
    :is="getComponent(property.type)"
    :definition="property"
    v-model="input[i]"
  />
</template>
