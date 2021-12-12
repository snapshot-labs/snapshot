<script setup>
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useApp } from '@/composables/useApp';

const { followingSpaces } = useFollowSpace();
const { explore } = useApp();

defineProps(['open']);
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>Spaces</h3>
    </template>
    <div class="m-4">
      <div class="text-center px-4 w-full">
        <UiButton
          v-for="space in followingSpaces"
          :key="space.id"
          class="w-full mb-2"
        >
          <TokenWithName :space="explore.spaces[space]" size="28" />
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
