<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useCopy } from '@/composables/useCopy';

defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string };
}>();

const { copyToClipboard } = useCopy();
</script>

<template>
  <div class="mt-3">
    <div class="flex justify-center">
      <BaseAvatar size="80" :address="userAddress" />
    </div>
    <div class="text-center">
      <div
        class="text-skin-link text-xl w-full truncate px-3"
        v-tippy="{
          content: profile?.name || profile.ens || 'unnamed'
        }"
      >
        {{ profile?.name || profile.ens || 'unnamed' }}
      </div>
      <div class="flex justify-center">
        <div
          @click="copyToClipboard(userAddress)"
          class="flex items-center text-xs text-skin-link bg-skin-border px-2 rounded-full cursor-pointer"
        >
          {{ shorten(userAddress) }}
          <i-ho-duplicate class="ml-1 text-xs" />
        </div>
      </div>
    </div>
  </div>
</template>
