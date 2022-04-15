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
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('settings.test') }}</h3>
      </div>
    </template>

    <InputUploadAvatar @image-uploaded="url => (form.avatar = url)">
      <template v-slot:avatar="{ uploading }">
        <BaseAvatar
          class="relative"
          :address="address"
          :imgsrc="getIpfsUrl(form.avatar)"
          :loading="uploading"
          size="80"
        />
      </template>
    </InputUploadAvatar>

    <div class="p-4">
      <SBaseInput
        v-model="form.username"
        title="Name"
        type="text"
        error="test"
      />
      <!-- <SBaseInput v-model="form.avatar" type="text" errors="test" /> -->
      <!-- <SBaseInput v-model="form.bio" type="text" errors="test" /> -->
    </div>
    <template v-slot:footer> </template>
  </BaseModal>
</template>
