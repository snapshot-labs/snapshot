<script setup lang="ts">
import { withDefaults } from 'vue';

interface SocialProps {
  social: {
    icon: string;
    link: string;
  };
  size: string;
}

withDefaults(defineProps<SocialProps>(), {
  size: '24'
});

const getUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};
</script>

<template>
  <BaseLink
    :link="getUrl(social.link)"
    hide-external-icon
    :disabled="!social.link"
  >
    <Icon
      :size="size"
      :name="social.icon"
      :class="social.link ? 'hover:opacity-80 text-skin-text' : 'opacity-10'"
    />
  </BaseLink>
</template>
