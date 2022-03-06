<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

type Link = RouteLocationRaw | string;

defineProps<{
  link: Link;
  hideExternalIcon?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <a
    v-if="typeof link === 'string'"
    :href="link"
    target="_blank"
    :class="`whitespace-nowrap ${disabled ? 'pointer-events-none' : ''}`"
    rel="noopener noreferrer"
  >
    <slot />
    <Icon v-if="!hideExternalIcon" name="external-link ml-1" />
  </a>
  <router-link
    v-else
    :to="link"
    :class="`whitespace-nowrap ${disabled ? 'pointer-events-none' : ''}`"
  >
    <slot />
  </router-link>
</template>
