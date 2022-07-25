<script setup lang="ts">
import { ref } from 'vue';
import { useIntl, useImageUpload, useSpaceCreateForm } from '@/composables';

defineProps<{
  preview: boolean;
  bodyLimit: number;
}>();

const { formatNumber } = useIntl();
const { form, getValidation } = useSpaceCreateForm();

const imageDragging = ref(false);
const textAreaEl = ref<HTMLTextAreaElement | null>(null);

const injectImageToBody = image => {
  const cursorPosition = textAreaEl.value?.selectionStart;
  const currentBody = textAreaEl.value?.value;
  const currentBodyWithImage = `${currentBody?.substring(
    0,
    cursorPosition
  )} \n![${image.name}](${image.url})
    ${currentBody?.substring(cursorPosition as number)}`;

  form.value.body = currentBodyWithImage;
};

const {
  upload,
  error: imageUploadError,
  uploading
} = useImageUpload({
  onSuccess: injectImageToBody
});

const handlePaste = e => {
  for (let i = 0; i < e.clipboardData.items.length; ++i) {
    let item = e.clipboardData.items[i];
    if (item.kind == 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      upload(new File([file], 'image', { type: file.type }));
    }
  }
};

const handleDrop = e => {
  for (let i = 0; i < e.dataTransfer.files.length; i++) {
    let item = e.dataTransfer.files[i];
    if (item.type.startsWith('image/')) {
      upload(item);
    }
  }
};
</script>

<template>
  <div class="px-4 md:px-0">
    <div class="flex flex-col space-y-3">
      <h1
        v-if="preview"
        class="w-full break-all"
        v-text="form.name || $t('create.untitled')"
      />
      <BaseInput
        v-else
        v-model="form.name"
        :title="$t('create.proposalTitle')"
        :max-length="128"
        :error="getValidation('name')"
        focus-on-mount
      />

      <div v-if="!preview">
        <div class="flex justify-between">
          <LabelInput>
            {{ $t('create.proposalDescription') }}
          </LabelInput>
          <div class="text-xs">
            {{ formatNumber(form.body.length) }} /
            {{ formatNumber(bodyLimit) }}
          </div>
        </div>
        <div
          @drop.prevent="handleDrop"
          @dragover="imageDragging = true"
          @dragleave="imageDragging = false"
        >
          <div
            class="peer min-h-[240px] overflow-hidden rounded-t-xl border focus-within:border-skin-text"
          >
            <textarea
              ref="textAreaEl"
              v-model="form.body"
              class="s-input mt-0 h-full min-h-[240px] w-full !rounded-xl border-none pt-0 text-base"
              :maxlength="bodyLimit"
              @paste="handlePaste"
            />
          </div>

          <label
            class="relative flex items-center justify-between rounded-b-xl border border-t-0 border-skin-border py-1 px-2 peer-focus-within:border-skin-text"
          >
            <input
              accept="image/jpg, image/jpeg, image/png"
              type="file"
              class="absolute top-0 right-0 bottom-0 left-0 ml-0 w-full p-[5px] opacity-0"
              @change="e => upload((e.target as HTMLInputElement)?.files?.[0])"
            />

            <span class="pointer-events-none relative pl-1 text-sm">
              <span v-if="uploading" class="flex">
                <LoadingSpinner small class="mr-2 -mt-[2px]" />
                {{ $t('create.uploading') }}
              </span>
              <span v-else-if="imageUploadError !== ''">
                {{ imageUploadError }}</span
              >
              <span v-else>
                {{ $t('create.uploadImageExplainer') }}
              </span>
            </span>
            <BaseLink
              v-tippy="{ content: $t('create.markdown') }"
              class="relative inline"
              link="https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              hide-external-icon
            >
              <BaseIcon name="markdown" class="text-skin-text" />
            </BaseLink>
          </label>
        </div>
      </div>

      <div v-if="form.body && preview" class="mb-4">
        <BaseMarkdown :body="form.body" />
      </div>

      <InputUrl
        v-if="!preview"
        v-model.trim="form.discussion"
        placeholder="https://forum.balancer.fi/proposal"
        :title="$t('create.discussion')"
        :error="getValidation('discussion')"
      />
    </div>
  </div>
</template>
