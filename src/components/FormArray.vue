<script setup lang="ts">
import { ref, watch } from 'vue';

import { FormError } from '@/helpers/interfaces';

import FormObject from '@/components/FormObject.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';
import InputSwitch from '@/components/InputSwitch.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: any;
  error?: FormError;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || []);

const getComponent = name => {
  switch (name) {
    case 'object':
      return FormObject;
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
</script>

<template>
  <div class="space-y-2">
    <div v-for="(property, i) in input" :key="i">
      <BaseBlock>
        <component
          :is="getComponent(definition.items.type)"
          v-model="input[i]"
          :definition="definition.items"
          :error="error"
        />
      </BaseBlock>
    </div>
    <BaseButton class="w-full" @click="input.push({})">Add</BaseButton>
  </div>
</template>
