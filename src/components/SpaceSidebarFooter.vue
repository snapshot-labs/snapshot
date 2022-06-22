<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeUrl } from '@braintree/sanitize-url';

const props = defineProps<{ space?: Record<string, any> }>();

type SocialLink = { icon: string; link: string };
const socials = computed<SocialLink[]>(() => {
  const socials: SocialLink[] = [];

  if (props.space?.twitter) {
    socials.push({
      icon: 'twitter',
      link: `https://twitter.com/${props.space?.twitter}`
    });
  }

  if (props.space?.github) {
    socials.push({
      icon: 'github',
      link: `https://github.com/${props.space?.github}`
    });
  }

  if (props.space?.website) {
    socials.push({
      icon: 'earth',
      link: sanitizeUrl(props.space?.website)
    });
  }

  return socials;
});
</script>

<template>
  <div class="my-3 flex items-center space-x-3 px-4">
    <IconSocial
      v-for="social in socials"
      :key="social.icon"
      :social="social"
      class="flex"
    />
  </div>
</template>
