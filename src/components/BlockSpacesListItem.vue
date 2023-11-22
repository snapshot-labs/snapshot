<script setup lang="ts">
import { Space } from '@/helpers/interfaces';

defineProps<{
  space: Space;
}>();
</script>

<template>
  <router-link
    :to="{
      name: 'spaceProposals',
      params: { key: space.id }
    }"
  >
    <div class="flex justify-center">
      <div
        class="flex justify-center rounded-full !border-[1px] !border-skin-text p-[2px]"
      >
        <AvatarSpace :space="space" symbol-index="space" size="48" />
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="truncate text-xs">
        {{ space.name }}
      </div>
      <IconVerifiedSpace
        v-if="space.verified"
        size="14"
        class="pl-1 text-primary"
      />
    </div>
  </router-link>
</template>
