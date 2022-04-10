<script setup lang="ts">
defineProps<{
  userAddress: string;
}>();
</script>

<template>
  <div>
    <h2>{{ $t('profile.about.header') }}</h2>
    <BaseBlock>
      <div class="space-y-4">
        <ProfileAboutBiography />
        <ProfileAboutSpacesList :userAddress="userAddress" />
      </div>
    </BaseBlock>
  </div>
</template>
