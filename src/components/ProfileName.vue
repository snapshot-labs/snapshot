<script setup lang="ts">
defineProps<{
  profile?: {
    ens?: string;
    name?: string;
  };
}>();
</script>

<template>
  <div
    class="text-skin-heading text-lg leading-10 font-semibold truncate px-3"
    v-tippy="{
      content: profile?.name || profile?.ens.split('.')[0] || 'unnamed'
    }"
  >
    {{ profile?.name || profile?.ens.split('.')[0] || 'unnamed' }}
  </div>
</template>
