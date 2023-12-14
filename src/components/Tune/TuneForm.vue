<script setup lang="ts">
import TuneForm from './TuneForm.vue';
import FormString from './_Form/FormString.vue';
import FormNumber from './_Form/FormNumber.vue';
import FormBoolean from './_Form/FormBoolean.vue';
import FormArray from './_Form/FormArray.vue';

const props = defineProps<{
  modelValue: Record<string, any>;
  definition: Record<string, any>;
  error: Record<string, any>;
}>();

const emit = defineEmits(['update:modelValue']);

const input = computed({
  get: () => props.modelValue || props.definition?.default || {},
  set: value => emit('update:modelValue', value)
});

const getComponent = (type: string) => {
  switch (type) {
    case 'object':
      return TuneForm;
    case 'string':
      return FormString;
    case 'number':
      return FormNumber;
    case 'boolean':
      return FormBoolean;
    case 'array':
      return FormArray;
    default:
      return null;
  }
};

const componentRefs = ref();

function forceShowError() {
  componentRefs?.value?.forEach((ref: any) => {
    if (ref?.forceShowError) ref?.forceShowError();
  });
}

defineExpose({
  forceShowError
});
</script>

<template>
  <div class="space-y-2">
    <component
      :is="getComponent(property.type)"
      v-for="(property, key) in definition.properties as Record<string, any>"
      ref="componentRefs"
      :key="key"
      v-model="input[key]"
      :definition="property"
      :error="error[key] || ''"
    />
  </div>
</template>
