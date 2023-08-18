<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const { web3Account } = useWeb3();

const showOnboarding = useStorage('snapshot.showOnboardingDelegates', true);
</script>

<template>
  <div ref="loggedAvatar" class="relative" @click="showOnboarding = false">
    <div
      v-if="showOnboarding"
      class="pointer-events-none absolute bottom-[52px] left-[22px] flex"
    >
      <i-s-line-arrow class="text-skin-text opacity-40" />
      <div
        class="absolute bottom-[30px] left-[42px] w-[102px] text-xs leading-4 opacity-60"
      >
        view and edit your delegator profile
      </div>
    </div>
    <BaseButtonRound class="!h-[46px] !w-[46px]">
      <AvatarUser :address="web3Account" size="20" class="cursor-pointer" />
    </BaseButtonRound>
  </div>
</template>
