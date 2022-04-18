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

    <div class="p-4">
      <SBaseLabel>{{ $t('profile image') }}</SBaseLabel>
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
            </template>
          </BaseAvatar>
        </template>
      </InputUploadAvatar>

      <SBaseInput
        v-model="form.name"
        title="username"
        type="text"
        placeholder="enter username"
        :maxLength="properties.name.maxLength"
        focusOnMount
      />
      <SBaseLabel> bio </SBaseLabel>
      <TextareaAutosize
        v-model="form.about"
        class="s-input !rounded-3xl"
        :maxLength="properties.about.maxLength"
        placeholder="tell the world your story"
      />
    </div>
    <template v-slot:footer>
      <BaseButton @click="null" class="w-full" primary>
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
