<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { getFileFromEvent, isFileOfType } from './utils';

const props = defineProps<{
  fileType: File['type'];
  error?: string | undefined;
  multiple?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:file', file: File | null): void;
  (
    event: 'update:fileInputState',
    state: 'IDLE' | 'ERROR' | 'INVALID_TYPE' | 'VALID'
  ): void;
}>();

const file = ref<File | null>(null);
const fileInputState = ref<'IDLE' | 'ERROR' | 'VALID' | 'INVALID_TYPE'>(
  props.error ? 'ERROR' : 'IDLE'
);

const isDropping = ref(false);

const handleFileChange = (event: Event | DragEvent) => {
  isDropping.value = false;
  const _file = getFileFromEvent(event);
  if (!_file) return;
  if (!isFileOfType(_file, props.fileType)) {
    fileInputState.value = 'INVALID_TYPE';
    file.value = null;
  } else {
    file.value = _file;
    fileInputState.value = 'VALID';
  }
};

watch(file, newFile => {
  emit('update:file', newFile);
});

watch(fileInputState, newState => {
  emit('update:fileInputState', newState);
});

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
    class="my-2 w-full group hover:bg-transparent hover:border-skin-text hover:text-skin-link hover:cursor-pointer inline-block border-2 border-dashed py-2 px-4 rounded-xl"
    :class="{
      'border-solid border-skin-text text-skin-link bg-transparent': isDropping,
      'bg-red/10 border-red/50 text-red/80':
        fileInputState === 'INVALID_TYPE' || props.error,
      'bg-green/10 border-green/50 text-green/80': fileInputState === 'VALID'
    }"
  >
    <div
      class="flex line-clamp-2 flex-col gap-1 items-center text-center justify-center"
    >
      <i-ho-upload />
      <span class="line-clamp-2">
        <template v-if="props.error">{{ props.error }}</template>
        <template v-else-if="fileInputState === 'INVALID_TYPE'"
          >File type must be <strong>{{ props.fileType }}</strong
          >. Please choose another.</template
        >

        <template v-else-if="fileInputState === 'VALID' && file">{{
          file.name
        }}</template>
        <template v-else="fileInputState === 'IDLE'"
          >Click to select file, or drag n drop</template
        >
      </span>
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
