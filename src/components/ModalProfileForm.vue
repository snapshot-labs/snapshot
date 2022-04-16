<script setup lang="ts">
import { ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { getIpfsUrl } from '@/helpers/utils';

defineProps<{
  address: string;
}>();

const open = ref(false);

const form = ref({
  username: '',
  avatar: '',
  bio: ''
});

const properties = schemas.profile.properties;
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('profile.settings.header') }}</h3>
      </div>
    </template>

    <div class="p-4">
      <InputUploadAvatar @image-uploaded="url => (form.avatar = url)">
        <template v-slot:avatar="{ uploading }">
          <BaseAvatar
            class="relative"
            :address="address"
            :imgsrc="getIpfsUrl(form.avatar)"
            size="80"
          >
            <transition name="fade">
              <div
                class="absolute right-0 left-0 top-0 bottom-0 cursor-pointer rounded-full group hover:opacity-80 hover:bg-skin-border transition-colors ease-out flex items-center justify-center"
                :class="{ 'opacity-80 bg-skin-border': uploading }"
              >
                <div class="group-hover:block hidden transition-all ease-out">
                  Edit
                </div>
                <LoadingSpinner v-if="uploading" />
              </div>
            </transition>
          </BaseAvatar>
        </template>
      </InputUploadAvatar>

      <SBaseInput
        v-model="form.username"
        title="Name"
        type="text"
        :maxLength="properties.username.maxLength"
        focusOnMount
      />
      <SBaseLabel> Bio </SBaseLabel>
      <TextareaAutosize
        class="s-input !rounded-3xl"
        :maxLength="properties.bio.maxLength"
      />
    </div>
    <template v-slot:footer>
      <BaseButton @click="null" class="w-full" primary>
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
