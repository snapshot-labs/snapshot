<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useApp } from '@/composables/useApp';
import { useProfiles } from '@/composables/useProfiles';

const props = withDefaults(
  defineProps<{
    address: string;
    size?: string;
    space?: { members: string[]; network: string };
    previewFile?: File | undefined;
  }>(),
  {
    size: '22'
  }
);

const { domain } = useApp();
const { profilesCreated } = useProfiles();

const timestamp = computed(() => {
  if (!props?.address || !profilesCreated.value?.[props.address]) return '';
  return `&ts=${profilesCreated.value[props.address]}`;
});
</script>

<template>
  <BaseLink
    :link="
      domain
        ? `https://snapshot.org/#/profile/${address}`
        : { name: 'profileActivity', params: { address } }
    "
    hide-external-icon
    @click.stop
  >
    <BaseAvatar
      :src="`https://stamp.fyi/avatar/eth:${address}?s=${
        Number(size) * 2
      }${timestamp}`"
      :previewFile="previewFile"
      :size="size"
    />
  </BaseLink>
</template>
