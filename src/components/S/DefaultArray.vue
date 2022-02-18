<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string[];
  definition: any;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref<string[]>(props.modelValue || props.definition.default || []);

onMounted(() => emit('update:modelValue', input.value));

watch(input, () => emit('update:modelValue', input.value));

function addItem() {
  input.value.push('');
}
</script>

<template>
  <SBase :definition="definition" :input="input">
    <div v-for="(item, i) in input" :key="i">
      <SDefaultString :definition="{ title: '' }" v-model="input[i]" />
    </div>
    <a @click="addItem">Add</a>
  </SBase>
</template>
