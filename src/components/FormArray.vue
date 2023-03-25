<script setup lang="ts">
import { computed } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

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

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const input = computed({
  get: () => props.modelValue || props.definition?.default || [],
  set: value => {
    emit('update:modelValue', value);
  }
});

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

  <FormArrayStrategies
    v-if="definition?.$id === 'strategies'"
    v-model="input"
    @update:is-valid="emit('update:isValid', $event)"
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
    <BaseButton
      class="w-full"
      @click="input.push(clone(definition?.items?.default))"
    >
      {{ $t('add') }}
    </BaseButton>
  </div>
</template>
