<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { about: string };
}>();
</script>

<template>
  <div>
    <h2 class="px-4 md:px-0">{{ $t('profile.about.header') }}</h2>
    <BaseBlock>
      <div class="space-y-4">
        <ProfileAboutBiography v-if="profile?.about" :about="profile?.about" />
        <ProfileAboutSpacesList :userAddress="userAddress" />
      </div>
    </BaseBlock>
  </div>
</template>
