<script setup lang="ts">
defineProps<{
  userAddress: string;
}>();
</script>

<template>
  <div>
    <h2>{{ $t('profile.about.header') }}</h2>
    <BaseBlock>
      <ProfileAboutSpacesList :userAddress="userAddress" />
    </BaseBlock>
  </div>
</template>
