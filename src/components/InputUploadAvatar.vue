<script setup lang="ts">
import { ref } from 'vue';
import { useImageUpload } from '@/composables/useImageUpload';

const emit = defineEmits(['image-uploaded']);

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInput.value?.click();
}

const { upload, uploading } = useImageUpload({
  onSuccess: image => {
    emit('image-uploaded', image.url);
  }
});
</script>

<template>
  <div class="flex justify-center">
    <div @click="openFilePicker()">
      <slot name="avatar" :uploading="uploading" />
    </div>
  </div>
  <input
    ref="fileInput"
    type="file"
    accept="image/jpg, image/jpeg, image/png"
    @change="e => upload((e.target as HTMLInputElement).files?.[0])"
    style="display: none"
  />
</template>
