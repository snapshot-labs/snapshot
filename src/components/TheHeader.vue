<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const visible = useStorage('snapshot.showHomeHeader', true);
</script>

<template>
  <BaseContainer v-if="visible" class="mb-4">
    <div
      class="relative w-full rounded-xl border border-skin-border p-4 pr-[280px]"
    >
      <h3 class="mt-0 font-mono">For DAOs, governance should be a snap</h3>
      <p>
        Snapshot is the home of your community's governance. It's a place where
        you can create proposals, weigh voting power in flexable ways, and vote
        completely off-chain.
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
