<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  moreToClaim: boolean;
  proposal: Proposal;
}>();

const emit = defineEmits(['close', 'openClaimModal']);

const { shareClaim } = useSharing();

function handleClose() {
  if (props.moreToClaim) {
    emit('openClaimModal');
  }
  emit('close');
}
</script>

<template>
  <TuneModal :open="open" @close="emit('close')">
    <div
      class="h-full bg-[url('@/assets/images/confetti.svg')] pt-[40px] bg-no-repeat"
    >
      <div class="text-center">
        <div
          class="w-[64px] h-[64px] mb-[24px] mx-auto shadow-xl bg-boost rounded-[20px] flex justify-center items-center"
        >
          <i-ho-gift class="text-white" />
        </div>
        <TuneModalTitle class="m-0 leading-6">
          Congratulations!
        </TuneModalTitle>
        <TuneModalDescription class="text-md leading-5 mt-1 mx-[48px]">
          Your rewards have been claimed.
        </TuneModalDescription>
      </div>
      <div
        class="border rounded-xl mx-3 p-[12px] border-boost/20 bg-boost/5 flex justify-between items-center mt-[40px]"
      >
        <div>
          <div class="font-semibold text-skin-heading leading-5 text-md">
            Tell the world!
          </div>
          <div class="leading-5 text-md">Share your victory with friends.</div>
        </div>
        <div class="flex gap-x-2">
          <TuneButton
            class="w-[46px] h-[46px] p-0 flex justify-center items-center"
            @click="shareClaim('x', { proposal: proposal })"
          >
            <i-s-x />
          </TuneButton>
          <TuneButton
            class="w-[46px] h-[46px] p-0 flex justify-center items-center"
            @click="shareClaim('hey', { proposal: proposal })"
          >
            <i-s-hey class="text-[#FB3A5D] text-sm" />
          </TuneButton>
        </div>
      </div>
      <div class="p-3 pt-[12px]">
        <TuneButton class="w-full" @click="handleClose">
          {{ moreToClaim ? 'Claim more' : 'Close' }}
        </TuneButton>
      </div>
    </div>
  </TuneModal>
</template>
