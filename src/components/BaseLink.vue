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
    <i-ho-external-link
      v-if="!hideExternalIcon"
      class="ml-1 mb-[2px] inline-block text-xs"
    />
  </a>
  <router-link
    v-else
    :to="link"
    :class="['whitespace-nowrap', { 'pointer-events-none': disabled }]"
  >
    <slot />
  </router-link>
</template>
