<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useApp } from '@/composables';

const { env } = useApp();

const visible = useStorage('snapshot.showHomeHeader', true);
</script>

<template>
  <BaseContainer v-if="visible && env === 'develop'" class="mb-4">
    <div class="relative w-full rounded-xl border border-skin-border p-4">
      <h3 class="mt-0 pr-6 font-space text-[29px]">
        {{ $t('header.title') }}
      </h3>
      <p class="mt-3 max-w-[500px]">
        {{ $t('header.description') }}
      </p>
      <div
        class="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3"
      >
        <BaseButton
          class="w-full md:w-auto"
          primary
          @click="$router.push({ name: 'setup' })"
        >
          {{ $t('createASpace') }}
        </BaseButton>
        <BaseButton
          class="w-full md:w-auto"
          @click="$router.push({ name: 'about' })"
        >
          {{ $t('learnMore') }}
        </BaseButton>
      </div>
      <BaseButtonIcon class="absolute right-3 top-3" @click="visible = false">
        <i-ho-x class="text-base" />
      </BaseButtonIcon>
    </div>
  </BaseContainer>
</template>
