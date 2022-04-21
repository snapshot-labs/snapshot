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
          content: profile?.name || profile.ens.split('.')[0] || 'unnamed'
        }"
      >
        {{ profile?.name || profile.ens.split('.')[0] || 'unnamed' }}
      </div>
      <div class="flex justify-center space-x-2 leading-5 px-3">
        <div
          v-if="profile.ens"
          @click="copyToClipboard(profile.ens)"
          class="flex items-center text-xs px-1 rounded-full cursor-pointer min-w-0"
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
    </div>
  </div>
</template>
