<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const userAddress = computed(() => route.params.address as string);
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <div class="fixed w-[240px]">
        <BaseBlock slim class="overflow-hidden py-3">
          <ProfileSidebarHeader :userAddress="userAddress" />
          <ProfileSidebarNavigation />
        </BaseBlock>
      </div>
    </template>
    <template #content-right>
      <router-view :userAddress="userAddress" />
    </template>
  </TheLayout>
</template>
