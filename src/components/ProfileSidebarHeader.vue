<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string; avatar?: string };
}>();
</script>

<template>
  <div class="mt-3">
    <div class="flex justify-center">
      <BaseAvatar
        size="69"
        :address="userAddress"
        :imgsrc="getIpfsUrl(profile?.avatar)"
      />
    </div>
    <div class="text-center">
      <ProfileName :profile="profile" :address="userAddress" />
      <ProfileAddressCopy
        :profile="profile"
        :userAddress="userAddress"
        class="justify-center"
      />
    </div>
  </div>
</template>
