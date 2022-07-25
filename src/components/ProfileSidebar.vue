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

const emit = defineEmits(['edit']);

const { web3Account } = useWeb3();
</script>

<template>
  <div class="lg:fixed lg:w-[240px]">
    <BaseBlock slim class="overflow-hidden">
      <div class="mt-4 flex px-4 lg:mt-0 lg:block lg:px-0">
        <ProfileSidebarHeader
          v-if="profiles[userAddress]"
          :user-address="userAddress"
          :profile="profiles[userAddress]"
        />
        <ProfileSidebarHeaderSkeleton v-else />

        <div
          v-if="userAddress === web3Account"
          class="flex flex-grow justify-end lg:mt-3 lg:flex-auto lg:justify-center"
        >
          <BaseButton
            :disabled="!profiles[userAddress]"
            class="whitespace-nowrap"
            @click="emit('edit')"
          >
            {{ $t('profile.buttonEdit') }}
          </BaseButton>
        </div>
      </div>

      <ProfileSidebarNavigation />
    </BaseBlock>
  </div>
</template>
