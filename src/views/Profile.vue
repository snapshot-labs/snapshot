<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const modalProfileFormOpen = ref(false);

const userAddress = computed(() => route.params.address as string);
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <div class="fixed w-[240px]">
        <BaseBlock slim class="overflow-hidden">
          <ProfileSidebarHeader :userAddress="userAddress" />
          <ProfileSidebarNavigation @edit="modalProfileFormOpen = true" />
        </BaseBlock>
      </div>
    </template>
    <template #content-right>
      <router-view :userAddress="userAddress" />
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalProfileForm
      :open="modalProfileFormOpen"
      @close="modalProfileFormOpen = false"
      :address="userAddress"
    />
  </teleport>
</template>
