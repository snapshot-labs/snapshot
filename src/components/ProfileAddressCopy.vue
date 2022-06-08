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
  <div class="flex space-x-2 px-3 leading-5">
    <div
      v-if="profile?.ens && profile?.name"
      class="flex min-w-0 cursor-pointer items-center rounded-full text-xs"
      @click="copyToClipboard(profile.ens)"
    >
      <div class="truncate">
        {{ profile.ens }}
      </div>
    </div>
    <div
      class="flex cursor-pointer items-center rounded border px-1 text-xs"
      @click="copyToClipboard(userAddress)"
    >
      {{ shorten(userAddress) }}
      <i-ho-duplicate class="ml-1 text-xs" />
    </div>
  </div>
</template>
