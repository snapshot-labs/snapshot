<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string; avatar?: string };
}>();
</script>

<template>
  <div>
    <AvatarUser size="48" :address="userAddress" />

    <div class="text-left">
      <ProfileName :profile="profile" :address="userAddress" />
      <ProfileAddressCopy :profile="profile" :user-address="userAddress" />
    </div>
  </div>
</template>
