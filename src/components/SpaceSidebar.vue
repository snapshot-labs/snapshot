<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import SpaceSidebarSubspaces from './SpaceSidebarSubspaces.vue';

defineProps<{ space: ExtendedSpace }>();
</script>

<template>
  <div style="position: fixed; width: 240px">
    <BaseBlock :slim="true" class="overflow-hidden">
      <SpaceSidebarHeader :space="space" />
      <SpaceSidebarNavigation :space="space" />
      <SpaceSidebarSubspaces :space="space" />
      <SpaceSidebarFooter :space="space" />
    </BaseBlock>
  </div>
</template>
