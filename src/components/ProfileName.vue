<script setup lang="ts">
import { shorten } from '@/helpers/utils';

defineProps<{
  address: string;
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
      content: profile?.name || profile?.ens || address
    }"
  >
    {{ profile?.name || profile?.ens || shorten(address) }}
  </div>
</template>
