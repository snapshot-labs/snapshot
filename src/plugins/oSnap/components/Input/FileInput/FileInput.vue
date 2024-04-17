<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { getFilesFromEvent, isFileOfType } from './utils';

type InputState = 'IDLE' | 'INVALID_TYPE' | 'VALID' | 'INVALID_QUANTITY';

const props = defineProps<{
  fileType: File['type'];
  error?: string | undefined;
  multiple?: boolean;
  defaultLabel?: string;
}>();

const emit = defineEmits<{
  (event: 'update:file', file: File | null): void;
  (event: 'update:fileInputState', state: InputState): void;
}>();
const inputRef = ref<HTMLInputElement>();
const file = ref<File | null>();
const fileInputState = ref<InputState>('IDLE');
const isDropping = ref(false);

const isError = computed(() => {
  return (
    !!props.error ||
    fileInputState.value === 'INVALID_TYPE' ||
    fileInputState.value === 'INVALID_QUANTITY'
  );
});

const isAccepted = computed(() => {
  return fileInputState.value === 'VALID' && !props?.error;
});

const handleFileChange = (event: Event | DragEvent) => {
  isDropping.value = false;
  const _files = getFilesFromEvent(event);
  if (!_files?.length) return;

  // enforce single drop based on props
  if (!props.multiple) {
    if (_files?.length && _files?.length > 1) {
      fileInputState.value = 'INVALID_QUANTITY';
      file.value = null;
      clearInputValue();
      return;
    }
  }
  const _file = _files[0];
  if (!isFileOfType(_file, props.fileType)) {
    fileInputState.value = 'INVALID_TYPE';
    file.value = null;
  } else {
    file.value = _file;
    fileInputState.value = 'VALID';
  }
  clearInputValue();
};

function clearInputValue() {
  if (inputRef?.value) {
    inputRef.value.value = '';
  }
}

function toggleDropping() {
  isDropping.value = !isDropping.value;
}

watch(file, newFile => {
  if (newFile) {
    emit('update:file', newFile);
  }
});

watch(fileInputState, newState => {
  emit('update:fileInputState', newState);
});
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
      'bg-red/10 border-red/50 text-red/80': isError,
      'bg-green/10 border-green/50 text-green/80': isAccepted
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
        <template v-else-if="fileInputState === 'INVALID_QUANTITY'"
          >Drop only <strong class="underline">one</strong> file at a time
        </template>
        <template v-else-if="fileInputState === 'VALID' && file">{{
          file.name
        }}</template>
        <template v-else="fileInputState === 'IDLE'">{{
          props.defaultLabel ?? 'Click to select file, or drag n drop'
        }}</template>
      </span>
    </div>

    <input
      ref="inputRef"
      id="file_input"
      class="hidden"
      :accept="props.fileType"
      type="file"
      @change="handleFileChange"
    />
  </label>
</template>
