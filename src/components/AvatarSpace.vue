<script setup lang="ts">
import { sha256 } from 'js-sha256';
import { withDefaults, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    space: { id: string; avatar: string };
    size?: string;
  }>(),
  {
    size: '22'
  }
);

const avatarHash = computed(() => {
  if (!props.space.avatar) return '';
  const hash = sha256(props.space.avatar).slice(0, 16);
  return `&cb=${hash}`;
});
</script>

<template>
  <BaseAvatar
    :size="size"
    :src="`https://stamp.fyi/space/${space.id}?s=${
      Number(size) * 2
    }${avatarHash}`"
  />
</template>
