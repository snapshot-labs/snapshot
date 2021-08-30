<script setup>
import { ref } from 'vue';

const emit = defineEmits(['loading', 'input']);

const loading = ref(false);

async function handleFileChange(e) {
  loading.value = true;
  emit('loading', loading.value);
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  try {
    const url = `${import.meta.env.VITE_HUB_URL}/api/upload`;
    const init = {
      method: 'POST',
      body: formData
    };
    const result = await fetch(url, init);
    const output = await result.json();
    emit('input', `ipfs://${output.file.ipfs_hash}`);
    loading.value = false;
    emit('loading', loading.value);
  } catch (error) {
    loading.value = false;
    emit('loading', loading.value);
    console.log(error);
  }
}
</script>

<style lang="scss" scoped>
.file-select > input[type='file'] {
  display: none;
  font-weight: normal;
}
label {
  all: initial;
  all: unset;

  &:hover {
    cursor: pointer;
  }
}
</style>

<template>
  <UiLoading v-if="loading" />
  <label v-else class="file-select">
    <input type="file" @change="handleFileChange" accept="image/*" />
    <slot />
  </label>
</template>
