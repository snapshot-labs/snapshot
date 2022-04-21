<template>
  <div class="flex space-x-3">
    <div v-for="n in 5" :key="n" class="animate-pulse">
      <div class="flex justify-center">
        <div class="flex border p-[2px] rounded-full">
          <div class="w-[48px] h-[48px] bg-skin-border rounded-full" />
        </div>
      </div>
      <div class="w-[66px] h-[14px] mt-[6px] bg-skin-border rounded" />
    </div>
  </div>
</template>
