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
      class="group min-w-[120px]"
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
        <span class="flex items-center gap-2 group-hover:hidden">
          <i-ho-check class="text-green" /> {{ $t('joined') }}
        </span>
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
