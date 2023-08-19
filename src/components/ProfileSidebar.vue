<script setup lang="ts">
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
    <BaseBlock
      slim
      class="-mt-1 overflow-hidden !border-t-0 md:mt-0 md:!border-t"
    >
      <div class="flex px-[20px] md:px-3 md:pt-3 lg:block">
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
            class="whitespace-nowrap lg:w-full"
            @click="emit('edit')"
          >
            <span>
              {{ $t('profile.buttonEdit') }}
            </span>
          </BaseButton>
        </div>
      </div>

      <ProfileSidebarNavigation />
    </BaseBlock>
  </div>
</template>
