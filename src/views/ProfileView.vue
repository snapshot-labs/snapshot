<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
const route = useRoute();

const modalProfileFormOpen = ref(false);

let userAddress = computed(() => {
  const address = route.params.address as string;
  try {
    return getAddress(address);
  } catch (error) {
    console.error(error);
    return '';
  }
});

const { profiles, loadProfiles } = useProfiles();

onMounted(() => loadProfiles([userAddress.value]));
</script>

<template>
  <BaseBlock v-if="!userAddress" class="text-center m-4">
    Invalid address
  </BaseBlock>
  <TheLayout v-else>
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
