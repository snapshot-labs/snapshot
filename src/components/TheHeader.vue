<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const visible = useStorage('snapshot.showHomeHeader', true);
</script>

<template>
  <BaseContainer v-if="visible" class="mb-4">
    <div
      class="relative w-full rounded-xl border border-skin-border p-4 pr-[50px]"
    >
      <h3 class="mt-0 font-mono">Welcome to the home for thousands of DAOs.</h3>
      <p>
        A snapshot space is your organization's decision-making feed. You set
        rules for new proposals and how voting power gets distributed. People
        can follow, receive notifications and vote. Explore the many existing
        spaces, join the projects behind them or start your own right now.
      </p>
      <div class="mt-4 space-x-3">
        <BaseButton primary @click="$router.push({ name: 'setup' })">
          Create a space
        </BaseButton>
        <BaseButton @click="$router.push({ name: 'about' })">
          Learn more
        </BaseButton>
      </div>
      <BaseButtonIcon class="absolute right-3 top-3" @click="visible = false">
        <i-ho-x class="text-base" />
      </BaseButtonIcon>
    </div>
  </BaseContainer>
</template>
