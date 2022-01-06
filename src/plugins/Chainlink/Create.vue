<script setup>
import { reactive, watch } from 'vue';

defineProps({
  space: Object,
  preview: Boolean
});

const emit = defineEmits(['update']);
const form = reactive({});
watch(form, form => emit('update', { key: 'Chainlink', form }));
</script>

<template>
  <Block v-if="space.plugins.Chainlink">
    <div>Chainlink oracle:</div>
    <div v-if="preview">{{ form.oracle }}</div>
    <UiButton class="w-full" v-else>
      <input
        class="input w-full"
        type="text"
        placeholder="0x123"
        v-model="form.oracle"
      />
    </UiButton>
  </Block>
</template>
