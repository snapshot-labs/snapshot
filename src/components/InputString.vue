<script setup lang="ts">
import { FormError } from '@/helpers/interfaces';

defineProps<{
  modelValue?: string;
  definition?: any;
  error?: FormError;
  placeholder?: string;
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseListbox
    v-if="definition.enum"
    :definition="definition"
    :model-value="modelValue || definition?.default"
    :items="
      definition.enum.map(e => ({
        value: e,
        extras: {
          translation: $t(`validation.passport-gated.operator.enums.${e}`)
        }
      }))
    "
    @update:model-value="emit('update:modelValue', $event)"
  />
  <BaseInput
    v-else
    :model-value="modelValue || definition?.default"
    :definition="definition"
    :error="error"
    :placeholder="placeholder"
    :information="information"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
