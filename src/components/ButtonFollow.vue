<script setup lang="ts">
import { computed } from 'vue';
import { useFollowSpace, useTerms, useClient } from '@/composables';
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { isGnosisSafe } = useClient();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);
const { clickFollow, loadingFollow, isFollowing } = useFollowSpace(
  props.space.id
);

const canFollow = computed(() =>
  props.space.terms ? termsAccepted.value || isFollowing.value : true
);
</script>

<template>
  <div
    v-tippy="{
      content: isGnosisSafe ? $t('walletNotSupported') : null
    }"
  >
    <BaseButton
      v-bind="$attrs"
      :loading="loadingFollow === space.id"
      :disabled="isGnosisSafe"
      style="width: 120px"
      class="group"
      :class="{
        'hover:!border-red hover:!bg-red hover:!bg-opacity-5 hover:!text-red':
          isFollowing
      }"
      @click.stop.prevent="
        loadingFollow !== ''
          ? null
          : canFollow
          ? clickFollow(space.id)
          : (modalTermsOpen = true)
      "
    >
      <span v-if="!isFollowing"> {{ $t('join') }} </span>
      <span v-else>
        <span class="group-hover:hidden"> {{ $t('joined') }} </span>
        <span class="hidden group-hover:block">
          {{ $t('leave') }}
        </span>
      </span>
    </BaseButton>
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
