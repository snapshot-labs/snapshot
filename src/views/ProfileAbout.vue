<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { about: string };
}>();
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography :about="profile?.about" />
      <ProfileAboutSpacesList :userAddress="userAddress" />
    </div>
  </div>
</template>
