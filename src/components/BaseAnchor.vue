<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

type Link = RouteLocationRaw | string;

defineProps<{
  link: Link;
  hideExternalIcon?: boolean;
}>();
</script>

<template>
  <a
    v-if="typeof link === 'string'"
    :href="link"
    target="_blank"
    class="whitespace-nowrap"
    rel="noopener noreferrer"
  >
    <slot />
    <Icon v-if="!hideExternalIcon" name="external-link ml-1" />
  </a>
  <router-link v-else :to="link" class="whitespace-nowrap">
    <slot />
  </router-link>
</template>
