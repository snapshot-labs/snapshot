<script setup>
defineProps({
  externalHref: String,
  hideExternalIcon: Boolean
});
</script>

<template>
  <a
    :href="externalHref"
    target="_blank"
    class="whitespace-nowrap"
    rel="noopener noreferrer"
  >
    <slot />
    <Icon v-if="!hideExternalIcon" name="external-link" />
  </a>
</template>
