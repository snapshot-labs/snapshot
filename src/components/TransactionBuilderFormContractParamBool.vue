<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label: string;
  }>(),
  {
    modelValue: false
  }
);

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const input = ref<boolean>(props.modelValue);
</script>

<template>
  <BaseListbox
    v-model="input"
    :items="[{ value: true }, { value: false }]"
    :label="label"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selected="{ selectedItem }">
      {{ selectedItem.value }}
    </template>
    <template #item="{ item }">
      {{ item.value }}
    </template>
  </BaseListbox>
</template>
