<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string };
}>();
</script>

<template>
  <div class="mt-3">
    <div class="flex justify-center">
      <BaseAvatar size="69" :address="userAddress" />
    </div>
    <div class="text-center">
      <ProfileName :profile="profile" />
      <ProfileAddressCopy :profile="profile" :userAddress="userAddress" />
    </div>
  </div>
</template>
