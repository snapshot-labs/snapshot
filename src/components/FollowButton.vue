<script setup>
import { computed } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useTerms } from '@/composables/useTerms';
import { useClient } from '@/composables/useClient';

const props = defineProps({ space: Object });

const { isGnosisSafe } = useClient();

const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const { clickFollow, loadingFollow, isFollowing } = useFollowSpace(
  props.space.id
);

const canFollow = computed(() => {
  if (props.space.terms) {
    if (termsAccepted.value || isFollowing.value) return true;
    else return false;
  } else return true;
});
</script>

<template>
  <div
    v-tippy="{
      content: isGnosisSafe ? $t('walletNotSupported') : null
    }"
  >
    <UiButton
      v-bind="$attrs"
      @click.stop.prevent="
        loadingFollow !== ''
          ? null
          : canFollow
          ? clickFollow(space.id)
          : (modalTermsOpen = true)
      "
      :loading="loadingFollow === space.id"
      :disabled="isGnosisSafe"
      style="width: 120px"
      no-focus
      class="mb-4 group"
      :class="{
        'hover:!border-red hover:!text-red hover:!bg-opacity-5 hover:!bg-red':
          isFollowing
      }"
    >
      <span v-if="!isFollowing"> {{ $t('join') }} </span>
      <span v-else>
        <span class="group-hover:hidden"> {{ $t('joined') }} </span>
        <span class="group-hover:block hidden">
          {{ $t('leave') }}
        </span>
      </span>
    </UiButton>
  </div>
  <teleport to="#modal">
    <ModalTerms
      v-if="space"
      :open="modalTermsOpen"
      :space="space"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), clickFollow(space.id)"
    />
  </teleport>
</template>
