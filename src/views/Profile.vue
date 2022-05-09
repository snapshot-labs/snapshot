<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProfiles } from '@/composables/useProfiles';

const route = useRoute();

const modalProfileFormOpen = ref(false);

const userAddress = computed(() => route.params.address as string);

const { profiles, loadProfiles } = useProfiles();

onMounted(() => loadProfiles([userAddress.value]));
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <ProfileSidebar
        @edit="modalProfileFormOpen = true"
        :profiles="profiles"
        :userAddress="userAddress"
      />
    </template>
    <template #content-right>
      <router-view
        :userAddress="userAddress"
        :profile="profiles[userAddress]"
      />
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalProfileForm
      :open="modalProfileFormOpen"
      @close="modalProfileFormOpen = false"
      :address="userAddress"
      :profile="profiles[userAddress]"
    />
  </teleport>
</template>
