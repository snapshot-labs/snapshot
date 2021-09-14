<script setup>
import { useFollowSpace } from '@/composables/useFollowSpace';

const props = defineProps({ space: Object });
const { clickFollow, loadingFollow, isFollowing, hoverJoin } = useFollowSpace(
  props.space
);
</script>

<template>
  <UiButton
    @click.stop="loadingFollow !== '' ? null : clickFollow(space.id)"
    @mouseenter="hoverJoin = space.id"
    @mouseleave="hoverJoin = ''"
    :loading="loadingFollow === space.id"
    :disable="false"
    style="width: 120px"
  >
    {{ isFollowing ? (hoverJoin ? $t('leave') : $t('joined')) : $t('join') }}
  </UiButton>
</template>
