<script setup lang="ts">
import { ref, watch } from 'vue';

import { FormError } from '@/helpers/interfaces';

import FormObject from '@/components/FormObject.vue';
import InputString from '@/components/InputString.vue';
import InputNumber from '@/components/InputNumber.vue';
import InputSwitch from '@/components/InputSwitch.vue';

const props = defineProps<{
  modelValue: any[];
  definition: any;
  error?: FormError;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || props.definition.default || []);

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
  <div v-if="definition?.items?.enum">
    <BaseListboxMultiple
      v-model="input"
      :items="definition.items.enum"
      :definition="definition"
    />
  </div>

  <div v-else class="space-y-2">
    <div v-for="(property, i) in input" :key="i" class="flex">
      <component
        :is="getComponent(definition?.items?.type || 'string')"
        v-model="input[i]"
        :definition="definition.items"
        :error="error"
        class="grow"
      />
      <BaseButtonIcon @click="input.splice(i, 1)">
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </div>
    <BaseButton class="w-full" @click="input.push(definition?.items?.default)">
      {{ $t('add') }}
    </BaseButton>
  </div>
</template>
