<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const visible = useStorage('snapshot.showHomeHeader', true);
</script>

<template>
  <BaseContainer v-if="visible" class="mb-4">
    <div
      class="relative w-full rounded-xl border border-skin-border p-4 md:pr-[200px]"
    >
      <h3 class="mt-0 pr-6 font-space sm:pr-0">{{ $t('header.title') }}</h3>
      <p>
        {{ $t('header.description') }}
      </p>
      <div
        class="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3"
      >
        <BaseButton
          class="w-full sm:w-[160px]"
          primary
          @click="$router.push({ name: 'setup' })"
        >
          {{ $t('createASpace') }}
        </BaseButton>
        <BaseButton
          class="w-full sm:w-[140px]"
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
