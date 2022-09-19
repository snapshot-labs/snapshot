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
        :profiles="profiles"
        :user-address="userAddress"
        class="mb-4 lg:mb-0"
        @edit="modalProfileFormOpen = true"
      />
    </template>
    <template #content-right>
      <router-view
        :user-address="userAddress"
        :profile="profiles[userAddress]"
      />
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalProfileForm
      :open="modalProfileFormOpen"
      :address="userAddress"
      :profile="profiles[userAddress]"
      @close="modalProfileFormOpen = false"
    />
  </teleport>
</template>
