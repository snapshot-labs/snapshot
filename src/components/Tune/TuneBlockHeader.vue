<script setup lang="ts">
defineProps<{
  title?: string;
  subTitle?: string;
  counter?: number;
  information?: string;
}>();
</script>

<template>
  <div class="flex justify-between p-3 pb-0">
    <h4>
      <div class="leading-5 flex items-center">
        <span class="text-skin-heading">
          {{ title }}
        </span>
        <BaseCounter :counter="counter" class="mx-1" />
      </div>
      <div class="text-skin-text font-normal leading-5 mt-1">
        {{ subTitle }}
      </div>
    </h4>
    <div class="flex items-center relative">
      <div class="absolute right-0 top-0 flex">
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
