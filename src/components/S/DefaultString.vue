<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  definition: any;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref<string>(props.modelValue || props.definition.default);

watch(input, () => {
  emit('update:modelValue', input.value);
});
</script>

<template>
  <SBase :definition="definition" :input="input">
    <input
      type="text"
      v-model="input"
      class="s-input"
      :placeholder="definition.examples && definition.examples[0]"
    />
  </SBase>
</template>
