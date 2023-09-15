<script setup lang="ts"></script>

<template>
  <div class="mt-[12px] space-y-[12px] px-[10px]">
    <div
      v-for="n in 5"
      :key="n"
      class="h-[40px] w-[40px] animate-pulse rounded-lg bg-skin-border"
    />
  </div>
</template>
