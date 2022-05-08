<script setup lang="ts">
import { sanitizeUrl } from '@braintree/sanitize-url';

type Link = Record<string, any> | string;

defineProps<{
  link: Link;
  hideExternalIcon?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <a
    v-if="typeof link === 'string'"
    :href="sanitizeUrl(link)"
    target="_blank"
    :class="['whitespace-nowrap', { 'pointer-events-none': disabled }]"
    rel="noopener noreferrer"
  >
    <slot />
    <BaseIcon v-if="!hideExternalIcon" name="external-link ml-1" />
  </a>
  <router-link
    v-else
    :to="link"
    :class="['whitespace-nowrap', { 'pointer-events-none': disabled }]"
  >
    <slot />
  </router-link>
</template>
