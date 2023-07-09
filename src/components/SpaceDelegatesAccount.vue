<script setup lang="ts">
import { useTippy } from 'vue-tippy';
import { useStorage } from '@vueuse/core';

const { web3Account } = useWeb3();

const loggedAvatar = ref();
const showOnboarding = useStorage('snapshot.showOnboardingDelegates', true);

const loggedAvatarTooltip = useTippy(loggedAvatar, {
  content: 'Delegation profile',
  placement: 'top-end',
  trigger: 'manual',
  showOnCreate: showOnboarding.value,
  onHide: () => {
    showOnboarding.value = false;
  }
});
</script>

<template>
  <div ref="loggedAvatar" @mouseenter="loggedAvatarTooltip.hide()">
    <AvatarUser :address="web3Account" size="42" class="cursor-pointer" />
  </div>
</template>
