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
    class="truncate px-3 text-lg font-semibold leading-10 text-skin-heading"
    v-tippy="{
      content: profile?.name || profile?.ens || address
    }"
  >
    {{ profile?.name || profile?.ens || shorten(address) }}
  </div>
</template>
