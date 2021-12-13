<script setup>
import { computed } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useTerms } from '@/composables/useTerms';
import { useClient } from '@/composables/useClient';

const props = defineProps({ space: Object });

const { isGnosisSafe } = useClient();

const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const { clickFollow, loadingFollow, isFollowing, hoverJoin } = useFollowSpace(
  props.space
);

const canFollow = computed(() => {
  if (props.space.terms) {
    if (termsAccepted.value || isFollowing.value) return true;
    else return false;
  } else return true;
});
</script>

<template>
  <UiButton
    v-bind="$attrs"
    @click.stop.prevent="
      loadingFollow !== ''
        ? null
        : canFollow
        ? clickFollow(space.id)
        : (modalTermsOpen = true)
    "
    @mouseenter="hoverJoin = space.id"
    @mouseleave="hoverJoin = ''"
    :loading="loadingFollow === space.id"
    :disabled="isGnosisSafe"
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
