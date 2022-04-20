<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProfiles } from '@/composables/useProfiles';
import { useWeb3 } from '@/composables/useWeb3';

const { web3Account } = useWeb3();
const route = useRoute();

const modalProfileFormOpen = ref(false);

const userAddress = computed(() => route.params.address as string);

const { profiles, loadProfiles } = useProfiles();

onMounted(() => loadProfiles([userAddress.value]));
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <div class="fixed w-[240px]">
        <BaseBlock slim class="overflow-hidden">
          <ProfileSidebarHeader
            v-if="profiles[userAddress]"
            :userAddress="userAddress"
            :profile="profiles[userAddress]"
          />
          <ProfileSidebarHeaderSkeleton v-else />
          <ProfileSidebarNavigation />
          <BaseButton
            v-if="userAddress === web3Account"
            @click="modalProfileFormOpen = true"
          >
            Edit
          </BaseButton>
        </BaseBlock>
      </div>
    </template>
    <template #content-right>
      <router-view :userAddress="userAddress" />
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalProfileForm
      v-if="profiles[userAddress]"
      :open="modalProfileFormOpen"
      @close="modalProfileFormOpen = false"
      :address="userAddress"
      :profile="profiles[userAddress]"
    />
  </teleport>
</template>
