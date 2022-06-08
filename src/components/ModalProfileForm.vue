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
  await fetch(`https://cdn.stamp.fyi/clear/avatar/eth:${props.address}`);
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
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('profile.settings.header') }}</h3>
      </div>
    </template>

    <div class="space-y-2 p-4">
      <div class="flex justify-center">
        <InputUploadAvatar
          :avatar="form.avatar"
          @image-uploaded="url => (form.avatar = url)"
          @image-remove="form.avatar = ''"
        >
          <template #avatar="{ uploading, previewFile }">
            <div class="relative">
              <AvatarUser
                :address="address"
                :preview-file="previewFile"
                size="80"
              />
              <AvatarOverlayEdit :loading="uploading" :avatar="form?.avatar" />
              <div
                class="absolute right-0 bottom-[2px] rounded-full bg-skin-heading p-1"
              >
                <i-ho-pencil class="text-[12px] text-skin-bg" />
              </div>
            </div>
          </template>
        </InputUploadAvatar>
      </div>

      <BaseInput
        v-model="form.name"
        :title="$t('profile.settings.name')"
        type="text"
        :placeholder="$t('profile.settings.namePlaceholder')"
        :max-length="properties.name.maxLength"
        focus-on-mount
      />
      <div>
        <LabelInput> {{ $t('profile.settings.biography') }} </LabelInput>
        <TextareaAutosize
          v-model="form.about"
          class="s-input !rounded-3xl"
          :max-length="properties.about.maxLength"
          :placeholder="$t('profile.settings.bioPlaceholder')"
        />
      </div>
    </div>
    <div class="p-4">
      <BaseButton
        :loading="actionLoading"
        class="w-full"
        primary
        @click="actionWithAlias(save)"
      >
        {{ $t('save') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
