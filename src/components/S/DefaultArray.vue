<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: Array,
  definition: Object
});

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || []);

onMounted(() => emit('update:modelValue', input.value));

watch(input, () => emit('update:modelValue', input.value));

function addItem() {
  input.value.push('');
}
</script>

<template>
  <SBase :definition="definition">
    <div v-for="(item, i) in input" :key="i">
      <SString :definition="{ title: '' }" v-model="input[i]" />
    </div>
    <a @click="addItem">Add</a>
  </SBase>
</template>
