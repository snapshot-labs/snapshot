<script setup>
import { reactive, watch } from 'vue';

defineProps({ preview: Boolean });

const emit = defineEmits(['update']);
const form = reactive({});
watch(form, form => emit('update', { key: 'Chainlink', form }));
</script>

<template>
  <Block>
    <div>Chainlink transaction data:</div>
    <div v-if="preview">{{ form.tx }}</div>
    <UiButton class="w-full" v-else>
      <input class="input w-full" type="text" v-model="form.tx" />
    </UiButton>
  </Block>
</template>