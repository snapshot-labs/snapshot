<script setup lang="ts">
import { useStorage } from '@vueuse/core';

defineProps<{
  open: boolean;
  size?: { width: string; height: string };
}>();

defineEmits(['close', 'start']);

const dontShowAgain = useStorage(
  'snapshot.boosts-modal-dont-show-again',
  false
);

const content = [
  {
    title: 'What are boosts?',
    description:
      'Boosts allow you to create incentives tied to specific proposals. By creating a Boost, you can reward users who participate in voting based on certain eligibility criteria that you define.'
  },
  {
    title: 'Get started',
    description:
      'Click "Get started" on the proposal page to set eligibility criteria, deposit amount, and maximum voting power for tailored rewards and increased participation.'
  },
  {
    title: 'Creation tips',
    description:
      'Ensure clear objectives, fair participation criteria, and a reasonable deposit amount to encourage broader engagement. Promote your Boost within the community for maximum impact.'
  }
];
</script>

<template>
  <TuneModal
    :open="open"
    hide-close
    :size="{ width: '860', height: '628' }"
    @close="$emit('close')"
  >
    <div class="flex">
      <div class="h-[628px] w-[240px] shrink-0 bg-snapshot relative">
        <div
          class="bg-[url('@/assets/images/stars-big.png')] absolute top-4 left-0 right-0 bottom-0"
        />
        <div class="flex justify-center items-center h-full">
          <div
            class="w-[80px] h-[80px] bg-skin-bg z-50 rounded-3xl flex items-center justify-center shadow-xl"
          >
            <i-s-boost-icon class="text-[30px] text-skin-link" />
          </div>
        </div>
      </div>

      <div class="p-[32px]">
        <TuneModalTitle as="h1" class="leading-7 mb-4"
          >Welcome to Boosts!</TuneModalTitle
        >
        <TuneModalDescription class="text-lg leading-6 mb-5">
          Welcome to the new Boosts feature on Snapshot! Boosts are a powerful
          way to incentivize voting on proposals while rewarding active
          participation within the community.
        </TuneModalDescription>
        <div class="space-y-5">
          <div v-for="(c, i) in content" :key="i">
            <h4 class="leading-5 mb-2">{{ c.title }}</h4>
            <p class="text-md leading-5">{{ c.description }}</p>
          </div>

          <div class="flex justify-between items-center">
            <TuneButton @click="$emit('start')"> Get started </TuneButton>
            <TuneCheckbox
              id="dont-show-again"
              v-model="dontShowAgain"
              class="text-sm"
              hint="Don't show this again"
            />
          </div>
        </div>
      </div>
    </div>
  </TuneModal>
</template>
