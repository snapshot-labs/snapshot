<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

defineProps<{
  getErrorMessage: (field: string) => string;
  name: string;
  about: string;
  categories: string[];
  avatar: string;
  private: boolean;
  terms?: string;
}>();

const emit = defineEmits([
  'update:name',
  'update:about',
  'update:categories',
  'update:avatar',
  'update:private',
  'update:terms'
]);
</script>

<template>
  <BaseBlock :title="$t('setup.profile')">
    <div class="space-y-2">
      <div class="flex flex-col-reverse sm:flex-row">
        <div class="mt-3 space-y-2 sm:mt-0 sm:w-2/3">
          <BaseInput
            :model-value="name"
            :title="$t(`spaceProfile.name.label`)"
            :error="getErrorMessage('name')"
            :max-length="schemas.space.properties.name.maxLength"
            :placeholder="$t('spaceProfile.name.placeholder')"
            focus-on-mount
            @update:model-value="value => emit('update:name', value)"
          />

          <LabelInput> {{ $t(`spaceProfile.about.label`) }} </LabelInput>
          <TextareaAutosize
            :model-value="about"
            class="s-input !rounded-3xl"
            :max-length="schemas.space.properties.about.maxLength"
            :placeholder="$t('spaceProfile.about.placeholder')"
            @update:model-value="value => emit('update:about', value)"
          />

          <ListboxMultipleCategories
            :categories="categories"
            @update-categories="value => emit('update:categories', value)"
          />

          <InputUrl
            :title="$t(`settings.terms`)"
            :model-value="terms"
            :error="getErrorMessage('terms')"
            placeholder="www.example.com/terms"
            @update:model-value="value => emit('update:terms', value)"
          />

          <BaseSwitch
            class="!mt-3"
            :model-value="private"
            :text-right="$t('settings.hideSpace')"
            @update:model-value="value => emit('update:private', value)"
          />
        </div>
        <div class="flex w-full justify-center sm:w-1/3">
          <div>
            <LabelInput>
              {{ $t('spaceProfile.avatar') }}
            </LabelInput>
            <InputUploadAvatar
              class="h-[80px]"
              @image-uploaded="url => emit('update:avatar', url)"
              @image-remove="() => emit('update:avatar', '')"
            >
              <template #avatar="{ uploading, previewFile }">
                <div class="relative">
                  <AvatarSpace
                    :preview-file="previewFile"
                    size="80"
                    :space="{ id: $route.params.ens as string ?? $route.params.key as string, avatar }"
                  />
                  <AvatarOverlayEdit :loading="uploading" />
                  <div
                    class="absolute right-0 bottom-[2px] rounded-full bg-skin-heading p-1"
                  >
                    <i-ho-pencil class="text-[12px] text-skin-bg" />
                  </div>
                </div>
              </template>
            </InputUploadAvatar>
          </div>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
