<script setup lang="ts">
import { withDefaults } from 'vue';

interface SocialProps {
  social: {
    icon: string;
    link: string;
  };
  size?: string;
}

withDefaults(defineProps<SocialProps>(), {
  size: '24'
});
</script>

<template>
  <BaseLink :link="social.link" hide-external-icon :disabled="!social.link">
    <BaseIcon
      :size="size"
      :name="social.icon"
      :class="social.link ? 'text-skin-text hover:opacity-80' : 'opacity-10'"
    />
  </BaseLink>
</template>
