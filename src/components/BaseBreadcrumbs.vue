<script setup lang="ts">
defineProps<{
  pages: { id?: string; name: string; to: string; current: boolean }[];
}>();
</script>

<template>
  <div class="flex items-center overflow-x-scroll no-scrollbar">
    <div v-for="(page, i) in pages" :key="i" class="flex items-center">
      <router-link v-if="!page.current" :to="page.to" class="flex items-center">
        <span class="text-skin-link truncate max-w-[180px]">{{
          page.name
        }}</span>
      </router-link>
      <div v-else class="flex cursor-default items-center">
        <span
          class="text-skin-link opacity-40 truncate max-w-[180px]"
          :class="{
            '!max-w-[320px]': page.id === 'proposal-title'
          }"
          >{{ page.name }}</span
        >
      </div>
      <div class="mx-1 flex h-[20px] w-[20px] items-center justify-center">
        <i-ho-chevron-right
          v-if="i < pages.length - 1"
          class="shrink-0 text-xs text-skin-text"
        />
      </div>
    </div>
  </div>
</template>
