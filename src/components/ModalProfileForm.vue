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
  form.value.name = props.profile?.name ?? '';
  form.value.avatar = props.profile?.avatar ?? '';
  form.value.about = props.profile?.about ?? '';
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
      <InputUploadAvatar @image-uploaded="url => (form.avatar = url)">
        <template v-slot:avatar="{ uploading }">
          <BaseAvatar
            class="relative"
            :address="address"
            :imgsrc="getIpfsUrl(form.avatar)"
            size="80"
          >
            <template v-slot:overlay="{ loadingImg }">
              <transition name="fade">
                <div
                  class="absolute right-0 left-0 top-0 bottom-0 cursor-pointer rounded-full group hover:opacity-80 hover:bg-skin-border transition-colors ease-out flex items-center justify-center"
                  :class="{
                    'opacity-80 bg-skin-border': uploading || loadingImg
                  }"
                >
                  <div
                    v-if="!uploading && !loadingImg"
                    class="group-hover:block hidden transition-all ease-out"
                  >
                    <i-ho-pencil class="text-md" />
                  </div>
                  <LoadingSpinner v-if="uploading || loadingImg" />
                </div>
              </transition>
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
