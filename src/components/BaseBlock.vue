<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title?: string;
  counter?: number;
  slim?: boolean;
  loading?: boolean;
  hideBottomBorder?: boolean;
  label?: string;
  labelTooltip?: string;
  information?: string;
  isCollapsable?: boolean;
}>();

const isCollapsed = ref(true);
</script>

<template>
  <div
    class="border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border"
  >
    <div
      v-if="title"
      class="flex h-[57px] justify-between rounded-t-none border-b border-skin-border px-4 pt-3 pb-[12px] md:rounded-t-lg"
      :class="{
        'border-b-0': hideBottomBorder || (isCollapsable && isCollapsed)
      }"
    >
      <h4 class="flex items-center">
        <div>
          {{ title }}
        </div>
        <IconInformationTooltip
          :information="information"
          class="ml-1 text-sm text-skin-text"
        />
        <BaseCounter :counter="counter" class="ml-1 inline-block" />
      </h4>
      <div class="flex items-center">
        <div
          v-if="label"
          v-tippy="{ content: labelTooltip ? labelTooltip : null }"
          class="text-xs text-skin-link"
          :class="{ 'cursor-help': labelTooltip }"
        >
          {{ label }}
        </div>
      </div>
      <BaseButtonIcon
        v-if="isCollapsable"
        class="pr-0"
        @click="isCollapsed = !isCollapsed"
      >
        <i-ho-chevron-up :class="[{ 'rotate-180': isCollapsed }]" />
      </BaseButtonIcon>
    </div>
    <div v-if="loading" class="block px-4 py-4">
      <div
        class="lazy-loading mb-2 rounded-md"
        style="width: 80%; height: 20px"
      />
      <div class="lazy-loading rounded-md" style="width: 50%; height: 20px" />
    </div>
    <div
      v-else-if="!isCollapsed || !isCollapsable"
      :class="!slim && 'p-4'"
      class="leading-5 sm:leading-6"
    >
      <slot />
    </div>
  </div>
</template>
