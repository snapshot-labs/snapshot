<script setup>
import ChainlinkCreate from './Chainlink/Create.vue';
import SafeSnapCreate from './safeSnap/Create.vue';

const props = defineProps({
  proposal: Object,
  space: Object,
  preview: Boolean,
  modelValue: Object
});
const emit = defineEmits(['update:modelValue']);
const update = (data) => {
  const allConfig = props.modelValue;
  allConfig[data.key] = data.form;
  emit('update:modelValue', allConfig);
}
</script>

<template>
  <ChainlinkCreate v-bind="props" @update="update" />
  <SafeSnapCreate v-bind="props" @update="update" />
</template>