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
}>();
</script>

<template>
  <div
    class="md:rounded-xl md:border border-y bg-skin-block-bg border-skin-border text-base"
  >
    <div
      v-if="title"
      class="px-4 pt-3 pb-[12px] flex rounded-t-none md:rounded-t-lg border-b border-skin-border justify-between"
      :class="{ 'border-b-0': hideBottomBorder }"
    >
      <h4 class="flex items-center">
        <div>
          {{ title }}
        </div>
        <BaseCounter :counter="counter" class="ml-2 inline-block" />
      </h4>
      <div class="flex items-center">
        <div
          v-if="label"
          class="border !border-skin-link text-skin-link text-xs rounded-full px-3 cursor-help"
          v-tippy="{ content: labelTooltip ? labelTooltip : null }"
        >
          {{ label }}
        </div>
        <BaseIcon
          v-else-if="icon && !iconHref"
          :name="icon"
          size="22"
          :class="['float-right pt-1', iconClass]"
          v-tippy="{ content: iconTooltip ? iconTooltip : null }"
        />
        <BaseLink v-else-if="iconHref" :link="iconHref" hideExternalIcon>
          <BaseIcon
            v-if="icon"
            :name="icon"
            size="22"
            :class="['float-right pt-1', iconClass]"
            v-tippy="{ content: iconTooltip ? iconTooltip : null }"
          />
        </BaseLink>
      </div>
    </div>
    <div v-if="loading" class="block px-4 py-4">
      <div
        class="rounded-md lazy-loading mb-2"
        style="width: 80%; height: 20px"
      />
      <div class="rounded-md lazy-loading" style="width: 50%; height: 20px" />
    </div>
    <div v-else :class="!slim && 'p-4'" class="leading-5 sm:leading-6">
      <slot />
    </div>
  </div>
</template>
