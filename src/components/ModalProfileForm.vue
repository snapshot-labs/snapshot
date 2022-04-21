<script setup lang="ts">
import { onMounted, ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { getIpfsUrl } from '@/helpers/utils';

const props = defineProps<{
  address: string;
  profile: { name?: string; about?: string; avatar?: string };
}>();

const properties = schemas.profile.properties;

const open = ref(false);

const form = ref({
  name: '',
  avatar: '',
  about: ''
});

onMounted(() => {
  form.value = {
    name: props.profile?.name ?? '',
    avatar: props.profile?.avatar ?? '',
    about: props.profile?.about ?? ''
  };
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('profile.settings.header') }}</h3>
      </div>
    </template>

    <div class="p-4 space-y-3">
      <div class="flex justify-center">
        <InputUploadAvatar @image-uploaded="url => (form.avatar = url)">
          <template v-slot:avatar="{ uploading, preview }">
            <BaseAvatar
              :address="address"
              :imgsrc="getIpfsUrl(form.avatar)"
              :preview="preview"
              size="80"
            >
              <template v-slot:overlay>
                <AvatarOverlayEdit :loading="uploading" />
                <div
                  class="bg-skin-heading absolute rounded-full p-1 right-0 bottom-[2px]"
                >
                  <i-ho-pencil class="text-skin-bg text-[12px]" />
                </div>
              </template>
            </BaseAvatar>
          </template>
        </InputUploadAvatar>
      </div>

      <SBaseInput
        v-model="form.name"
        :title="$t('profile.settings.name')"
        type="text"
        :placeholder="$t('profile.settings.namePlaceholder')"
        :maxLength="properties.name.maxLength"
        focusOnMount
      />
      <div>
        <SBaseLabel> {{ $t('profile.settings.biography') }} </SBaseLabel>
        <TextareaAutosize
          v-model="form.about"
          class="s-input !rounded-3xl"
          :maxLength="properties.about.maxLength"
          :placeholder="$t('profile.settings.bioPlaceholder')"
        />
      </div>
      <BaseButton @click="null" class="w-full !mt-5" primary>
        {{ $t('save') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
