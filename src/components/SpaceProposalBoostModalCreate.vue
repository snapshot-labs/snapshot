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
    title: 'Who are boosts for?',
    description:
      "Boosts are primarily for DAOs that want to increase voting participation. They can also serve as a tool for 'bribes' in DeFi, incentivizing specific actions or decisions."
  },
  {
    title: 'Distribution',
    description:
      'Rewards are distributed either proportionally to voting power or through a lottery system. The lottery system is weighted by voting power, meaning the more voting power, the higher your chances of winning.'
  },
  {
    title: 'Disclaimer',
    description:
      'Boosts are a new and experimental feature and currently not audited. Use at your own risk.'
  }
];
</script>

<template>
  <TuneModal :open="open" size="big" @close="$emit('close')">
    <TuneModalTitle as="h1" class="md:hidden text-lg px-[20px] py-3 leading-6"
      >Welcome to Boosts!</TuneModalTitle
    >
    <div class="md:flex">
      <div
        class="h-[160px] md:h-[628px] md:w-[240px] shrink-0 bg-boost relative"
      >
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

      <div class="flex flex-col justify-between">
        <div
          class="p-[20px] md:p-[32px] overflow-y-auto max-h-[calc(100vh-330px)] md:max-h-[500px]"
        >
          <TuneModalTitle as="h1" class="hidden md:block leading-7 mb-4"
            >Welcome to Boosts!</TuneModalTitle
          >
          <TuneModalDescription class="text-lg leading-6 mb-5">
            Boosts are a powerful way to incentivize voting on proposals by
            rewarding active participation and more.
          </TuneModalDescription>
          <div class="space-y-5">
            <div v-for="(c, i) in content" :key="i">
              <h4 class="leading-5 mb-2">{{ c.title }}</h4>
              <p class="text-md leading-5">{{ c.description }}</p>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between items-center border-t md:border-0 px-[20px] py-3 md:p-[32px]"
        >
          <TuneCheckbox
            id="dont-show-again"
            v-model="dontShowAgain"
            class="text-sm"
            hint="Don't show this again"
          />
          <TuneButton @click="$emit('start')"> Get started </TuneButton>
        </div>
      </div>
    </div>
  </TuneModal>
</template>
