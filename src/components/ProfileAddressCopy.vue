<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useCopy } from '@/composables/useCopy';

defineProps<{
  profile?: {
    ens?: string;
    name?: string;
  };
  userAddress: string;
}>();

const { copyToClipboard } = useCopy();
</script>

<template>
  <div class="flex space-x-2 leading-5 px-3">
    <div
      v-if="profile?.ens && profile?.name"
      @click="copyToClipboard(profile.ens)"
      class="flex items-center text-xs rounded-full cursor-pointer min-w-0"
    >
      <div class="truncate">
        {{ profile.ens }}
      </div>
    </div>
    <div
      @click="copyToClipboard(userAddress)"
      class="flex items-center text-xs px-1 rounded border cursor-pointer"
    >
      {{ shorten(userAddress) }}
      <i-ho-duplicate class="ml-1 text-xs" />
    </div>
  </div>
</template>
