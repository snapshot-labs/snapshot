<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <TuneModal :open="open" @close="emit('close')">
    <div class="h-full bg-[url('@/assets/images/stars-purple.svg')] py-[48px]">
      <div class="text-center">
        <div
          class="w-[64px] h-[64px] mb-[40px] mx-auto shadow-xl bg-boost rounded-[20px] flex justify-center items-center"
        >
          <i-ho-gift class="text-white" />
        </div>
        <TuneModalTitle class="m-0 leading-6">
          Congratulations!
        </TuneModalTitle>
        <TuneModalDescription class="text-md leading-5 mt-1">
          You have now claimed your rewards!
        </TuneModalDescription>
      </div>
      <!-- <div class="flex flex-col gap-[12px] items-center mt-[24px]">
        <TuneButton class="flex items-center gap-2">
          <i-s-twitter class="text-[#1DA1F2]" />
          Share with world
        </TuneButton>
        <TuneButton class="flex items-center gap-2 border-0 -my-2">
          <i-s-hey class="text-[#FB3A5D]" />
          Share on Hey
        </TuneButton>
      </div> -->
    </div>
  </TuneModal>
</template>
