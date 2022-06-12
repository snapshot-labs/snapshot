<script setup lang="ts">
defineProps<{
  title?: string;
  counter?: number;
  slim?: boolean;
  icon?: string;
  iconClass?: string;
  iconTooltip?: string;
  iconHref?: string;
  loading?: boolean;
  hideBottomBorder?: boolean;
  label?: string;
  labelTooltip?: string;
  information?: string;
}>();
</script>

<template>
  <div
    class="border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border"
  >
    <div
      v-if="title"
      class="flex justify-between rounded-t-none border-b border-skin-border px-4 pt-3 pb-[12px] md:rounded-t-lg"
      :class="{ 'border-b-0': hideBottomBorder }"
    >
      <h4 class="flex items-center">
        <div>
          {{ title }}
        </div>
        <IconInformationTooltip
          :information="information"
          class="ml-1 text-sm text-skin-text"
        />
        <BaseCounter :counter="counter" class="ml-3 inline-block" />
      </h4>
      <div class="flex items-center">
        <div
          v-if="label"
          v-tippy="{ content: labelTooltip ? labelTooltip : null }"
          class="cursor-help rounded-full border !border-skin-link px-3 text-xs text-skin-link"
        >
          {{ label }}
        </div>
        <BaseIcon
          v-else-if="icon && !iconHref"
          v-tippy="{ content: iconTooltip ? iconTooltip : null }"
          :name="icon"
          size="22"
          :class="['float-right pt-1', iconClass]"
        />
        <BaseLink v-else-if="iconHref" :link="iconHref" hide-external-icon>
          <BaseIcon
            v-if="icon"
            v-tippy="{ content: iconTooltip ? iconTooltip : null }"
            :name="icon"
            size="22"
            :class="['float-right pt-1', iconClass]"
          />
        </BaseLink>
      </div>
    </div>
    <div v-if="loading" class="block px-4 py-4">
      <div
        class="lazy-loading mb-2 rounded-md"
        style="width: 80%; height: 20px"
      />
      <div class="lazy-loading rounded-md" style="width: 50%; height: 20px" />
    </div>
    <div v-else :class="!slim && 'p-4'" class="leading-5 sm:leading-6">
      <slot />
    </div>
  </div>
</template>
