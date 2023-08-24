<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const { web3Account } = useWeb3();

const showOnboarding = useStorage('snapshot.showDelegatesOnboarding', {});

const showOnboardingDelegates = computed({
  get: () => showOnboarding.value[web3Account.value],
  set: value => {
    showOnboarding.value[web3Account.value] = value;
  }
});
</script>

<template>
  <div
    ref="loggedAvatar"
    class="relative"
    @click="showOnboardingDelegates = false"
  >
    <div
      v-if="showOnboardingDelegates !== false"
      class="pointer-events-none absolute bottom-[46px] left-[22px] hidden md:flex"
    >
      <i-s-line-arrow class="text-skin-text opacity-40" />
      <div
        class="absolute bottom-[30px] left-[42px] w-[102px] text-xs leading-4 opacity-60"
      >
        view and edit your delegator profile
      </div>
    </div>
    <BaseButtonRound>
      <AvatarUser :address="web3Account" size="20" class="cursor-pointer" />
    </BaseButtonRound>
  </div>
</template>
