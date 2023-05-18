<script lang="ts" setup>
import { shorten } from '@/helpers/utils';

defineProps({
  collectible: { type: Object, required: true }
});
</script>

<template>
  <div class="group flex w-[186px] cursor-pointer flex-col">
    <div
      class="flex h-[186px] w-[186px] flex-row items-center justify-center rounded-xl border border-skin-link bg-skin-border"
    >
      <BaseIcon
        name="snapshot"
        size="50"
        class="text-primary group-hover:text-snapshot"
      />
    </div>
    <div class="flex w-[186px] flex-row">
      <span class="text-center text-skin-link">
        {{ shorten(collectible.title, 32) }}
      </span>
    </div>
  </div>
</template>
