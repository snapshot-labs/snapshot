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
    id: 1,
    title: 'How does it work?',
    description:
      'When you create a boost, you specify the amount of tokens you want to deposit and the rules for distribution. After the boost was created you receive an NFT from the Boost contract, this represents the ownership of the boost and can be used to withdraw unclaimed rewards.'
  },
  {
    id: 2,
    title: 'Distribution',
    description:
      'Rewards are distributed either proportionally to voting power or through a lottery system. The lottery system is weighted by voting power, meaning the more voting power, the higher your chances of winning.'
  },
  {
    id: 3,
    title: 'Disclaimer',
    description:
      'Boosts are a new and experimental feature and currently not audited. Use at your own risk.'
  }
];
</script>

<template>
  <TuneModal :open="open" size="big" @close="$emit('close')">
    <TuneModalTitle as="h1" class="md:hidden text-lg px-[20px] py-3 leading-6"
      >Welcome to Boost!</TuneModalTitle
    >
    <div class="md:flex">
      <div
        class="h-[160px] md:h-[506px] md:w-[240px] shrink-0 bg-boost relative"
      >
        <div
          class="md:bg-[url('@/assets/images/stars-big.svg')] bg-right bg-[url('@/assets/images/stars-big-horizontal.svg')] md:bg-cover absolute top-0 left-0 right-0 bottom-0"
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
          class="p-[20px] md:pb-0 md:p-[32px] overflow-y-auto max-h-[calc(100vh-330px)] md:max-h-[410px]"
        >
          <TuneModalTitle as="h1" class="hidden md:block leading-7 mb-4"
            >Welcome to Boost!</TuneModalTitle
          >
          <TuneModalDescription class="text-lg leading-6 mb-5">
            Boosts are a powerful way to incentivize voting on proposals by
            rewarding active participation or specific actions.
          </TuneModalDescription>
          <div class="space-y-5">
            <div v-for="(c, i) in content" :key="i">
              <h4 class="leading-5 mb-2">{{ c.title }}</h4>
              <p class="text-md leading-5">{{ c.description }}</p>
              <p v-if="c.id === 1" class="text-md leading-5 mt-3">
                <BaseLink link="https://docs.snapshot.org/user-guides/boost"
                  >Learn more</BaseLink
                >
              </p>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between items-center border-t md:border-0 px-[20px] py-3 md:p-[32px] md:!pt-0"
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
