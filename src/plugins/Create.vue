<script setup>
import ChainlinkCreate from './Chainlink/Create.vue';

const props = defineProps({
  proposal: Object,
  space: Object,
  preview: Boolean,
  modelValue: Object
});
const emit = defineEmits(['update:modelValue']);
const update = (event) => {
  const allConfig = props.modelValue;
  allConfig[event.key] = event.form;
  emit('update:modelValue', allConfig);
}
</script>

<template>
  <template v-if="space.plugins">
    <ChainlinkCreate v-bind="props" @update="update" />
  </template>
</template>