<script setup lang="ts">
defineProps<{ about: string }>();
</script>

<template>
  <div>
    <h3>{{ $t('profile.about.biography') }}</h3>
    <p>
      <TextAutolinker :text="about" />
    </p>
  </div>
</template>
