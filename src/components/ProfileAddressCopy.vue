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
      @click="copyToClipboard(profile.ens)"
      class="flex min-w-0 cursor-pointer items-center rounded-full text-xs"
    >
      <div class="truncate">
        {{ profile.ens }}
      </div>
    </div>
    <div
      @click="copyToClipboard(userAddress)"
      class="flex cursor-pointer items-center rounded border px-1 text-xs"
    >
      {{ shorten(userAddress) }}
      <i-ho-duplicate class="ml-1 text-xs" />
    </div>
  </div>
</template>
