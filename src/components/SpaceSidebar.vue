<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import SpaceSidebarSubspaces from './SpaceSidebarSubspaces.vue';

defineProps<{ space: ExtendedSpace }>();
</script>

<template>
  <div class="-mt-[4px] mb-[20px] md:mt-0 lg:fixed lg:mb-0 lg:w-[240px]">
    <BaseBlock slim class="overflow-hidden !border-t-0 md:!border-t">
      <div class="relative lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
        <SpaceSidebarHeader :space="space" />
        <SpaceSidebarNavigation :space="space" class="lg:mt-0" />
        <SpaceSidebarSubspaces :space="space" class="hidden lg:flex" />
        <SpaceSidebarFooter :space="space" class="hidden lg:flex" />
        <div
          class="absolute -top-1 right-[16px] md:right-[12px] md:top-[10px] lg:right-[10px]"
        >
          <SpaceSidebarMenuThreeDot class="hidden lg:block" />
        </div>
      </div>
    </BaseBlock>
  </div>
</template>
