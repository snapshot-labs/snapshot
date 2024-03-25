<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { getFileFromEvent, isFileOfType } from './utils';

// Props definition
const props = defineProps<{
  fileType: File['type'];
  error?: string | undefined;
}>();

// Emits definition
const emit = defineEmits<{
  (event: 'update:file', file: File | null): void;
  (
    event: 'update:fileInputState',
    state: 'IDLE' | 'ERROR' | 'INVALID_TYPE' | 'VALID'
  ): void;
}>();

// Internal state
const file = ref<File | null>(null);
const fileInputState = ref<'IDLE' | 'ERROR' | 'VALID' | 'INVALID_TYPE'>(
  props.error ? 'ERROR' : 'IDLE'
);

// Computed properties for UI updates
const isDropping = ref(false);

// Methods
const handleFileChange = (event: Event | DragEvent) => {
  isDropping.value = false;
  const _file = getFileFromEvent(event);
  if (!_file) return;
  if (!isFileOfType(_file, props.fileType)) {
    fileInputState.value = 'INVALID_TYPE';
    file.value = null;
  } else {
    file.value = _file;
    fileInputState.value = 'VALID'; // Assume file parsing success, handle errors appropriately
  }
};

// Watchers
watch(file, newFile => {
  emit('update:file', newFile);
});

watch(fileInputState, newState => {
  emit('update:fileInputState', newState);
});

// Utility functions
const toggleDropping = () => {
  isDropping.value = !isDropping.value;
};
</script>

<template>
  <label
    for="file_input"
    @dragenter.prevent="toggleDropping"
    @dragleave.prevent="toggleDropping"
    @dragover.prevent
    @drop.prevent="handleFileChange($event)"
    class="my-2 w-full group hover:bg-transparent hover:border-skin-text hover:cursor-pointer inline-block border border-dashed py-2 px-4 rounded-xl"
    :class="{
      'border-solid border-skin-text text-skin-text bg-transparent': isDropping,
      'bg-red/10 border-red/50 text-red/80':
        fileInputState === 'INVALID_TYPE' || props.error,
      'bg-green/10 border-green/50 text-green/80': fileInputState === 'VALID'
    }"
  >
    <div class="flex flex-col gap-1 items-center justify-center">
      <i-ho-upload />
      <span v-if="fileInputState === 'VALID' && file">{{ file.name }}</span>
      <span v-else-if="fileInputState === 'INVALID_TYPE'"
        >File type must be <strong>{{ props.fileType }}</strong
        >. Please choose another.</span
      >
      <span v-else-if="props.error">{{ props.error }}</span>

      <span v-else="fileInputState === 'IDLE'"
        >Click to select file, or drag n drop</span
      >
    </div>

    <input
      size=""
      id="file_input"
      class="hidden"
      :accept="props.fileType"
      type="file"
      @change="handleFileChange"
    />
  </label>
</template>
