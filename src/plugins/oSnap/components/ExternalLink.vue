<script setup lang="ts">
import { sanitizeUrl } from '@braintree/sanitize-url';

type Link = Record<string, any> | string;

defineProps<{
  link: Link;
  hideIcon?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <a
    v-if="typeof link === 'string'"
    :href="sanitizeUrl(link)"
    target="_blank"
    :class="[
      'inline-flex w-full items-center gap-2 whitespace-nowrap rounded-3xl border border-skin-border bg-skin-bg px-4 font-semibold first-letter:capitalize leading-[42px] hover:border-skin-text',
      { 'pointer-events-none': disabled }
    ]"
    rel="noopener noreferrer"
  >
    <slot />
    <i-ho-external-link v-if="!hideIcon" class="ml-auto text-sm" />
  </a>
  <router-link
    v-else
    :to="link"
    :class="['whitespace-nowrap', { 'pointer-events-none': disabled }]"
  >
    <slot />
    <i-ho-external-link v-if="!hideIcon" class="ml-auto text-sm" />
  </router-link>
</template>
