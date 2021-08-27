<script setup>
import { useFollowSpace } from '@/composables/useFollowSpace';

const props = defineProps({ space: Object });
const { clickFollow, loadingFollow, isFollowing, hoverJoin } = useFollowSpace(
  props.space
);
</script>

<template>
  <UiButton
    @click.stop="loadingFollow !== '' ? null : clickFollow(space.key)"
    @mouseenter="hoverJoin = space.key"
    @mouseleave="hoverJoin = ''"
    :loading="loadingFollow === space.key"
    :disable="false"
    class="mb-4"
    style="width: 120px"
  >
    {{ isFollowing ? (hoverJoin ? $t('leave') : $t('joined')) : $t('join') }}
  </UiButton>
</template>
