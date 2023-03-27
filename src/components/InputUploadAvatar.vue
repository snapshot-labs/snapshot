<script setup lang="ts">
const props = defineProps<{
  isViewOnly?: boolean;
}>();

const emit = defineEmits(['image-uploaded', 'image-remove']);

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  if (props.isViewOnly) return;
  fileInput.value?.click();
}

const uploadSuccess = ref(false);
const previewFile = ref<File | undefined>(undefined);

const { upload, isUploadingImage } = useImageUpload();

function onFileChange(e) {
  uploadSuccess.value = false;
  if ((e.target as HTMLInputElement).files?.[0])
    previewFile.value = (e.target as HTMLInputElement).files?.[0];
  upload(previewFile.value, image => {
    uploadSuccess.value = true;
    emit('image-uploaded', image.url);
  });
}
</script>

<template>
  <div @click="openFilePicker()">
    <slot
      name="avatar"
      :uploading="isUploadingImage"
      :previewFile="uploadSuccess ? previewFile : undefined"
    />
  </div>
  <input
    v-bind="$attrs"
    ref="fileInput"
    type="file"
    accept="image/jpg, image/jpeg, image/png"
    style="display: none"
    @change="onFileChange"
  />
</template>
