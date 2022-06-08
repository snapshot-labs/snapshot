<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';

defineProps<{
  userAddress: string;
  profiles: {
    [address: string]: {
      ens: string;
      name?: string;
      about?: string;
    };
  };
}>();

const { web3Account } = useWeb3();
</script>

<template>
  <div class="fixed w-[240px]">
    <BaseBlock slim class="overflow-hidden">
      <ProfileSidebarHeader
        v-if="profiles[userAddress]"
        :userAddress="userAddress"
        :profile="profiles[userAddress]"
      />
      <ProfileSidebarHeaderSkeleton v-else />

      <div
        v-if="userAddress === web3Account"
        class="mt-3 flex justify-center pt-1"
      >
        <BaseButton :disabled="!profiles[userAddress]" @click="$emit('edit')">
          {{ $t('profile.buttonEdit') }}
        </BaseButton>
      </div>

      <ProfileSidebarNavigation class="mt-3" />
    </BaseBlock>
  </div>
</template>
