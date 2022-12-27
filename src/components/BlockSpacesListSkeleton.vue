<script setup lang="ts">
defineProps<{
  numberOfSpaces: number;
}>();
</script>

<template>
  <div class="flex justify-between">
    <div v-for="n in numberOfSpaces + 1" :key="n" class="animate-pulse">
      <div class="flex justify-center">
        <div class="flex rounded-full border p-[2px]">
          <div class="h-[48px] w-[48px] rounded-full bg-skin-border" />
        </div>
      </div>
      <div class="mt-[6px] h-[14px] w-[66px] rounded bg-skin-border" />
    </div>
  </div>
</template>
