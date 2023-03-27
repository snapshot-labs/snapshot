<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    address: string;
    size?: string;
    previewFile?: File | undefined;
  }>(),
  {
    size: '22',
    previewFile: undefined
  }
);

const { profilesCreated } = useProfiles();

const timestamp = computed(() => {
  if (!props?.address || !profilesCreated.value?.[props.address]) return '';
  return `&ts=${profilesCreated.value[props.address]}`;
});
</script>

<template>
  <BaseAvatar
    :src="`https://cdn.stamp.fyi/avatar/eth:${address}?s=${
      Number(size) * 2
    }${timestamp}`"
    :preview-file="previewFile"
    :size="size"
  />
</template>
