<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string; avatar?: string };
}>();
</script>

<template>
  <div class="mt-3">
    <div class="flex justify-center">
      <AvatarUser size="69" :address="userAddress" />
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
