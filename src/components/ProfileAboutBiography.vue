<script setup lang="ts">
defineProps<{ about?: string }>();
</script>

<template>
  <BaseBlock :title="$t('profile.about.biography')">
    <template v-if="about" v-slot:namedDefault>
      <TextAutolinker :text="about" />
    </template>
  </BaseBlock>
</template>
