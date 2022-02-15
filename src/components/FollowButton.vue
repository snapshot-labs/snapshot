<script setup>
import { computed } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useTerms } from '@/composables/useTerms';
import { useClient } from '@/composables/useClient';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({ space: Object });

const { isGnosisSafe } = useClient();
const { web3 } = useWeb3();

const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const { clickFollow, loadingFollow, isFollowing, hoverJoin } = useFollowSpace(
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
      content: isGnosisSafe || web3.isTrezor ? $t('walletNotSupported') : null
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
      @mouseenter="hoverJoin = space.id"
      @mouseleave="hoverJoin = ''"
      :loading="loadingFollow === space.id"
      :disabled="isGnosisSafe || web3.isTrezor"
      style="width: 120px"
      class="mb-4"
    >
      {{ isFollowing ? (hoverJoin ? $t('leave') : $t('joined')) : $t('join') }}
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
