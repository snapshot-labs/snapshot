<script setup lang="ts">
defineProps<{
  title?: string;
  subTitle?: string;
  counter?: number;
  information?: string;
}>();
</script>

<template>
  <div class="flex justify-between p-3">
    <h4 class="">
      <div class="leading-5 flex items-center">
        <span class="text-skin-heading">
          {{ title }}
        </span>
        <BaseCounter :counter="counter" class="ml-1 inline-block" />
      </div>
      <div class="text-skin-text font-normal">
        {{ subTitle }}
      </div>
    </h4>
    <div class="flex items-center relative">
      <div class="absolute right-0">
        <slot v-if="$slots.default" />
        <IconInformationTooltip
          v-else
          :information="information"
          class="ml-1 !text-base text-skin-text"
        />
      </div>
    </div>
  </div>
</template>
