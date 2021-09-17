<script setup>
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useTerms } from '@/composables/useTerms';

const props = defineProps({ space: Object });

const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const { clickFollow, loadingFollow, isFollowing, hoverJoin } = useFollowSpace(
  props.space
);
</script>

<template>
  <UiButton
    @click.stop="
      loadingFollow !== ''
        ? null
        : !termsAccepted && !isFollowing
        ? (modalTermsOpen = true)
        : clickFollow(space.id)
    "
    @mouseenter="hoverJoin = space.id"
    @mouseleave="hoverJoin = ''"
    :loading="loadingFollow === space.id"
    :disable="false"
    style="width: 120px"
    class="mb-4"
  >
    {{ isFollowing ? (hoverJoin ? $t('leave') : $t('joined')) : $t('join') }}
  </UiButton>
  <teleport to="#modal">
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), clickFollow(space.id)"
    />
  </teleport>
</template>
