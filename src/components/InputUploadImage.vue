<script setup>
import { ref } from 'vue';
import { upload as pin } from '@snapshot-labs/pineapple';

const emit = defineEmits(['loading', 'input']);

const loading = ref(false);

async function handleFileChange(e) {
  loading.value = true;
  emit('loading', loading.value);
  const file = e.target.files[0];
  const formData = new FormData();
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    console.log('File type not supported');
    loading.value = false;
    return;
  }
  formData.append('file', file);
  try {
    const receipt = await pin(formData);
    emit('input', `ipfs://${receipt.cid}`);
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
  <LoadingSpinner v-if="loading" />
  <label v-else class="file-select">
    <input
      type="file"
      accept="image/jpg, image/jpeg, image/png"
      @change="handleFileChange"
    />
    <slot />
  </label>
</template>
