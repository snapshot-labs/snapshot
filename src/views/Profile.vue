<script setup lang="ts">
import { ref } from 'vue';
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <div class="fixed w-[240px]">
        <BaseBlock slim class="overflow-hidden py-3">
          <ProfileSidebarNavigation />
        </BaseBlock>
      </div>
    </template>
    <template #content-right>
      <router-view />
    </template>
  </TheLayout>
</template>
