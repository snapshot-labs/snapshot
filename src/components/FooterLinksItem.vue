<script setup lang="ts">
defineProps<{
  link: any;
}>();
</script>

<template>
  <BaseLink
    :link="link"
    hide-external-icon
    class="flex items-center justify-center text-skin-text hover:text-skin-link md:justify-start"
  >
    <slot />
  </BaseLink>
</template>
