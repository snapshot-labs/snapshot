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
  <div v-for="(property, i) in definition.properties" :key="i">
    <SObject
      v-if="property.type === 'object'"
      :definition="property"
      v-model="input[i]"
    />
    <SArray
      v-if="property.type === 'array'"
      :definition="property"
      v-model="input[i]"
    />
    <SString
      v-if="property.type === 'string'"
      :definition="property"
      v-model="input[i]"
    />
    <SNumber
      v-if="property.type === 'number'"
      :definition="property"
      v-model="input[i]"
    />
    <SBoolean
      v-if="property.type === 'boolean'"
      :definition="property"
      v-model="input[i]"
    />
  </div>
</template>
