<script setup lang="ts">
import { ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);

const avatarNotReactive = ref(form.value.avatar);
</script>

<template>
  <BaseBlock :title="$t('settings.profile')">
    <div class="space-y-2">
      <div class="flex flex-col-reverse sm:flex-row">
        <div class="mt-3 w-full space-y-2 sm:mt-0">
          <div class="flex w-full">
            <div>
              <LabelInput>
                {{ $t('settings.avatar') }}
              </LabelInput>
              <InputUploadAvatar
                class="h-[80px]"
                @image-uploaded="url => (form.avatar = url)"
                @image-remove="() => (form.avatar = '')"
              >
                <template #avatar="{ uploading, previewFile }">
                  <div class="relative">
                    <AvatarSpace
                      :preview-file="previewFile"
                      size="80"
                      :space="{ id: $route.params.ens as string ?? $route.params.key as string, avatar: avatarNotReactive }"
                    />
                    <AvatarOverlayEdit
                      :loading="uploading"
                      :avatar="form?.avatar"
                    />
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

          <BaseInput
            v-model="form.name"
            :title="$t(`settings.name.label`)"
            :error="getValidation('name')"
            :max-length="schemas.space.properties.name.maxLength"
            :placeholder="$t('settings.name.placeholder')"
            focus-on-mount
          />

          <LabelInput> {{ $t(`settings.about.label`) }} </LabelInput>
          <TextareaAutosize
            v-model="form.about"
            class="s-input !rounded-3xl"
            :max-length="schemas.space.properties.about.maxLength"
            :placeholder="$t('settings.about.placeholder')"
          />

          <ListboxMultipleCategories
            :categories="form.categories"
            @update-categories="value => (form.categories = value)"
          />

          <InputUrl
            v-model="form.website"
            :title="$t('settings.website')"
            :error="getValidation('website')"
            :max-length="schemas.space.properties.website.maxLength"
            placeholder="e.g. https://www.example.com"
          />

          <InputUrl
            v-model="form.terms"
            :title="$t(`settings.terms.label`)"
            :information="$t('settings.terms.information')"
            :error="getValidation('terms')"
            placeholder="e.g. https://example.com/terms"
          />

          <BaseSwitch
            v-model="form.private"
            class="!mt-3"
            :text-right="$t('settings.hideSpace')"
          />
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
