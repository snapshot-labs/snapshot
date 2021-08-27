<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: Object,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || {});

onMounted(() => emit('update:modelValue', input.value));

watch(input, () => emit('update:modelValue', input.value));
</script>

<template>
  <label>{{ definition.title }}</label>
  <div v-for="(property, i) in definition.properties" :key="i">
    <VObject
      v-if="property.type === 'object'"
      :definition="property"
      v-model="input[i]"
    />
    <VArray
      v-if="property.type === 'array'"
      :definition="property"
      v-model="input[i]"
    />
    <VString
      v-if="property.type === 'string'"
      :definition="property"
      v-model="input[i]"
    />
    <VNumber
      v-if="property.type === 'number'"
      :definition="property"
      v-model="input[i]"
    />
    <VBoolean
      v-if="property.type === 'boolean'"
      :definition="property"
      v-model="input[i]"
    />
    <legend v-if="definition.description" v-text="definition.description" />
  </div>
</template>
