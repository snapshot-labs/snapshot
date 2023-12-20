<script setup lang="ts">
import { Space, RankedSpace, ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: Space | RankedSpace | ExtendedSpace;
  primary?: boolean;
}>();

const { domain } = useApp();
const { isGnosisSafe } = useClient();
const { web3Account } = useWeb3();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);
const { clickFollow, loadingFollow, isFollowing, loadFollows } = useFollowSpace(
  props.space.id
);

const canFollow = computed(() =>
  props.space.terms ? termsAccepted.value || isFollowing.value : true
);

watch(
  web3Account,
  () => {
    // Only for custom domain, else follows are loaded on sidebar
    domain && loadFollows(props.space.id);
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-tippy="{
      content: isGnosisSafe ? $t('walletNotSupported') : null
    }"
    v-bind="$attrs"
  >
    <TuneButton
      v-bind="$attrs"
      :loading="loadingFollow === space.id"
      :disabled="isGnosisSafe"
      class="group min-w-[125px]"
      :class="{
        'flex items-center justify-center hover:!border-red hover:!bg-red hover:!bg-opacity-5 hover:!text-red':
          isFollowing
      }"
      :primary="primary"
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
    </TuneButton>
  </div>
  <teleport to="#modal">
    <ModalTerms
      v-if="space"
      :open="modalTermsOpen"
      :space="space"
      :action="$t('modalTerms.actionJoin')"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), clickFollow(space.id)"
    />
  </teleport>
</template>
