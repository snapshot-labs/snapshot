<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const visible = useStorage('snapshot.showHomeHeader', true);
</script>

<template>
  <BaseContainer v-if="visible" class="mb-4">
    <div
      class="relative w-full rounded-xl border border-skin-border p-4 pr-[50px]"
    >
      <h3 class="mt-0 font-mono">Where decisions get made</h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <div class="mt-4 space-x-3">
        <BaseButton primary @click="$router.push({ name: 'setup' })">
          Create a space
        </BaseButton>
        <BaseButton> Learn more </BaseButton>
      </div>
      <BaseButtonIcon class="absolute right-3 top-3" @click="visible = false">
        <i-ho-x class="text-base" />
      </BaseButtonIcon>
    </div>
  </BaseContainer>
</template>
