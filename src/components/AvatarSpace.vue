<script setup lang="ts">
import { sha256 } from 'js-sha256';
import { withDefaults, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    space: { id: string };
    size?: string;
  }>(),
  {
    size: '22'
  }
);

const avatarHash = computed(() => sha256(props.space.id).slice(0, 8));
</script>

<template>
  <BaseAvatar
    :size="size"
    :src="`https://stamp.fyi/space/${space.id}?s=${
      Number(size) * 2
    }&hash=${avatarHash}`"
  />
</template>
