<script setup lang="ts">
import { FormError } from '@/helpers/interfaces';

import FormObject from '@/components/FormObject.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';
import InputSwitch from '@/components/InputSwitch.vue';

const props = defineProps<{
  modelValue?: any[];
  definition?: any;
  error?: FormError;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition?.default || []);

const getComponent = (type: string) => {
  switch (type) {
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
  <BaseListboxMultiple
    v-if="definition?.items?.anyOf"
    v-model="input"
    :items="
      definition.items.anyOf.map(item => ({
        value: item.const,
        title: item.title
      }))
    "
    :definition="definition"
  />

  <div v-else class="space-y-2">
    <div v-for="(property, i) in input" :key="i">
      <component
        :is="getComponent(definition?.items?.type || 'string')"
        v-model="input[i]"
        :definition="definition.items"
        :error="error"
      />
    </div>
    <BaseButton class="w-full" @click="input.push(definition?.items?.default)">
      {{ $t('add') }}
    </BaseButton>
  </div>
</template>
