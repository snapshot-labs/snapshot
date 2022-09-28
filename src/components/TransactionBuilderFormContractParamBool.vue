<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    boolValue: boolean;
    label: string;
  }>(),
  {
    boolValue: false
  }
);

const emit = defineEmits<{
  (e: 'updateBoolValue', value: boolean): void;
}>();

const input = ref<boolean>(props.boolValue);

onMounted(() => (input.value = props.boolValue));

watch(input, () => emit('updateBoolValue', input.value), { immediate: true });
</script>

<template>
  <BaseListbox
    v-model="input"
    :items="[{ value: true }, { value: false }]"
    :label="label"
    @update:model-value="input = $event"
  >
    <template #selected="{ selectedItem }">
      {{ selectedItem.value }}
    </template>
    <template #item="{ item }">
      {{ item.value }}
    </template>
  </BaseListbox>
</template>
