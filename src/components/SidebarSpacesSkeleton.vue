<script setup lang="ts"></script>

<template>
  <div class="mt-2 space-y-2 px-2">
    <div
      v-for="n in 5"
      :key="n"
      class="h-[44px] w-[44px] animate-pulse rounded-full bg-skin-border"
    />
  </div>
</template>
