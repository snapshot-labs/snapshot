<template>
  <div class="flex space-x-3">
    <div v-for="n in 5" :key="n" class="animate-pulse">
      <div class="w-[44px] h-[44px] bg-skin-border rounded-full" />
      <div class="w-[44px] h-[10px] mt-[6px] bg-skin-border rounded-full"></div>
    </div>
  </div>
</template>
