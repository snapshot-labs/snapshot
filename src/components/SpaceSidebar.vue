<script setup lang="ts">
defineProps<{ space: Record<string, any> }>();
</script>

<template>
  <div style="position: fixed; width: 240px">
    <BaseBlock :slim="true" class="overflow-hidden">
      <SpaceSidebarHeader :space="space" />
      <SpaceSidebarNavigation :space="space" />
      <SpaceSidebarFooter :space="space" />
    </BaseBlock>
  </div>
</template>
