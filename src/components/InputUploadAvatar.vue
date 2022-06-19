<script setup lang="ts">
import { ref } from 'vue';
import { useImageUpload } from '@/composables/useImageUpload';

defineProps<{
  avatar?: string;
}>();

const emit = defineEmits(['image-uploaded', 'image-remove']);

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

function handleSelect(e) {
  if (e === 'change') return openFilePicker();
  if (e === 'remove') {
    emit('image-remove', '');
    return (previewFile.value = undefined);
  }
}
</script>

<template>
  <div @click="avatar ? null : openFilePicker()">
    <BaseDropdown
      :items="[
        { text: $t('profile.settings.change'), action: 'change' },
        { text: $t('profile.settings.remove'), action: 'remove' }
      ]"
      @select="handleSelect"
    >
      <template #button>
        <slot
          name="avatar"
          :uploading="uploading"
          :previewFile="uploadSuccess ? previewFile : undefined"
        />
      </template>
    </BaseDropdown>
  </div>
  <input
    ref="fileInput"
    type="file"
    accept="image/jpg, image/jpeg, image/png"
    style="display: none"
    @change="onFileChange"
  />
</template>
