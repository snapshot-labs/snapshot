<script setup lang="ts">
import { watch, ref, defineEmits } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useAliasAction } from '@/composables/useAliasAction';
import client from '@/helpers/clientEIP712';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useI18n } from '@/composables/useI18n';
import { useProfiles } from '@/composables/useProfiles';

const props = defineProps<{
  address: string;
  profile?: { name?: string; about?: string; avatar?: string };
  open: boolean;
}>();

const emit = defineEmits(['close']);

const { aliasWallet, actionWithAlias, actionLoading } = useAliasAction();
const { web3Account } = useWeb3();
const { notify } = useFlashNotification();
const { t } = useI18n();
const { reloadProfile } = useProfiles();

const properties = schemas.profile.properties;

const form = ref({
  name: '',
  avatar: '',
  about: ''
});

async function clearAvatarCache() {
  await fetch(`https://stamp.fyi/clear/avatar/eth:${props.address}`);
}

async function save() {
  await client.profile(aliasWallet.value, aliasWallet.value.address, {
    from: web3Account.value,
    timestamp: Number((Date.now() / 1e3).toFixed()),
    profile: JSON.stringify(form.value)
  });
  await clearAvatarCache();
  reloadProfile(props.address);
  emit('close');
  return notify(['green', t('notify.saved')]);
}

watch(
  () => props.open,
  () => {
    form.value = {
      name: props.profile?.name ?? '',
      avatar: props.profile?.avatar ?? '',
      about: props.profile?.about ?? ''
    };
  },
  { immediate: true }
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('profile.settings.header') }}</h3>
      </div>
    </template>

    <div class="p-4 space-y-2">
      <div class="flex justify-center">
        <InputUploadAvatar
          :avatar="form.avatar"
          @image-uploaded="url => (form.avatar = url)"
          @image-remove="form.avatar = ''"
        >
          <template v-slot:avatar="{ uploading, previewFile }">
            <div class="relative">
              <AvatarUser
                :address="address"
                :previewFile="previewFile"
                size="80"
              />
              <AvatarOverlayEdit :loading="uploading" :avatar="form?.avatar" />
              <div
                class="bg-skin-heading absolute rounded-full p-1 right-0 bottom-[2px]"
              >
                <i-ho-pencil class="text-skin-bg text-[12px]" />
              </div>
            </div>
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
    </div>
    <div class="p-4">
      <BaseButton
        @click="actionWithAlias(save)"
        :loading="actionLoading"
        class="w-full"
        primary
      >
        {{ $t('save') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
