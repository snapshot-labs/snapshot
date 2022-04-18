<script setup lang="ts">
import { ref } from 'vue';
import { useImageUpload } from '@/composables/useImageUpload';

const emit = defineEmits(['image-uploaded']);

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInput.value?.click();
}

const uploadSuccess = ref(false);
const previewFile = ref<File | undefined>(undefined);

const { upload, uploading } = useImageUpload({
  onSuccess: image => {
    uploadSuccess.value = true;
    emit('image-uploaded', image.url);
  }
});

function onFileChange(e) {
  uploadSuccess.value = false;
  previewFile.value = (e.target as HTMLInputElement).files?.[0];
  upload(previewFile.value);
}
</script>

<template>
  <div class="flex">
    <div @click="openFilePicker()">
      <slot
        name="avatar"
        :uploading="uploading"
        :preview="[uploadSuccess, previewFile]"
      />
    </div>
  </div>
  <input
    ref="fileInput"
    type="file"
    accept="image/jpg, image/jpeg, image/png"
    @change="onFileChange"
    style="display: none"
  />
</template>
