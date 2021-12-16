<script setup>
import { onMounted, ref, watch } from 'vue';
import { defineAsyncComponent } from 'vue';
import capitalize from 'lodash/capitalize';

const props = defineProps({
  modelValue: Object,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || {});

const getComponent = name => {
  return defineAsyncComponent(() => import(`./${capitalize(name)}.vue`));
};

onMounted(() => emit('update:modelValue', input.value));

watch(input, () => emit('update:modelValue', input.value));
</script>

<template>
  <div v-for="(property, i) in definition.properties" :key="i">
    <component
      :is="getComponent(property.type)"
      :v-model="input[i]"
      :definition="property"
    />
  </div>
</template>
