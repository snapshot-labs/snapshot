<script setup lang="ts">
defineProps<{ about: string }>();
</script>

<template>
  <BaseBlock :title="$t('profile.about.biography')">
    <TextAutolinker :text="about" />
  </BaseBlock>
</template>
