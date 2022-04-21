<script setup lang="ts">
defineProps<{
  profile?: {
    ens?: string;
    name?: string;
    about?: string;
  };
}>();
</script>

<template>
  <div
    class="text-skin-heading text-xl truncate px-3"
    v-tippy="{
      content: profile?.name || profile?.ens.split('.')[0] || 'unnamed'
    }"
  >
    {{ profile?.name || profile?.ens.split('.')[0] || 'unnamed' }}
  </div>
</template>
