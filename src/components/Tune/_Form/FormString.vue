<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    definition: any;
    error?: string;
  }>(),
  {
    error: ''
  }
);
const emit = defineEmits(['update:modelValue']);

const textInputRef = ref();

function forceShowError() {
  textInputRef?.value?.forceShowError();
}

defineExpose({
  forceShowError
});

const itemsListbox = computed(() => {
  if (props.definition?.enum) {
    return props.definition.enum.map((item: any) => ({
      value: item
    }));
  } else if (props.definition?.anyOf) {
    return props.definition.anyOf.map((item: any) => ({
      value: item.const,
      name: item.title
    }));
  }
  return [];
});
</script>

<template>
  <TuneListbox
    v-if="definition?.enum || definition?.anyOf"
    ref="textInputRef"
    :items="itemsListbox"
    :model-value="modelValue"
    :definition="definition"
    :error="error"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <TuneTextarea
    v-else-if="definition?.format === 'long'"
    ref="textInputRef"
    v-bind="props"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <TuneInput
    v-else
    ref="textInputRef"
    v-bind="props"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
