<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import SpaceSidebarSubspaces from './SpaceSidebarSubspaces.vue';

defineProps<{ space: ExtendedSpace }>();
</script>

<template>
  <div class="mb-4 lg:fixed lg:mb-0 lg:w-[240px]">
    <BaseBlock slim class="overflow-hidden">
      <div class="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
        <SpaceSidebarHeader :space="space" />
        <SpaceSidebarNavigation :space="space" class="mt-4 lg:mt-0" />
        <SpaceSidebarSubspaces :space="space" class="hidden lg:flex" />
        <SpaceSidebarFooter :space="space" class="hidden lg:flex" />
      </div>
    </BaseBlock>
  </div>
</template>
