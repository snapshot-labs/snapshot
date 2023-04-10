<script setup lang="ts">
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
  showMoreButton?: boolean;
  showMoreButtonLabel?: string;
  loadingMore?: boolean;
}>();

defineEmits(['showMore']);

const isCollapsed = ref(true);
</script>

<template>
  <div
    class="border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border"
  >
    <div
      v-if="title"
      class="group flex h-[57px] justify-between rounded-t-none border-b border-skin-border px-4 pb-[12px] pt-3 md:rounded-t-lg"
      :class="[
        {
          'border-b-0': hideBottomBorder || (isCollapsable && isCollapsed)
        },
        { 'cursor-pointer': isCollapsable }
      ]"
      @click="isCollapsable ? (isCollapsed = !isCollapsed) : null"
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
      <slot name="button" />
      <BaseButtonIcon
        v-if="isCollapsable"
        class="pr-0 group-hover:text-skin-link"
      >
        <i-ho-chevron-up :class="[{ 'rotate-180': isCollapsed }]" />
      </BaseButtonIcon>
    </div>
    <div v-if="loading" class="block px-4 py-4">
      <LoadingList />
    </div>
    <Transition name="fade">
      <div
        v-if="!loading && (!isCollapsed || !isCollapsable)"
        :class="!slim && 'p-4'"
        class="leading-5 sm:leading-6"
      >
        <slot />
        <div
          v-if="showMoreButton"
          class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
        >
          <LoadingSpinner v-if="loadingMore" />
          <button v-else @click="$emit('showMore')">
            <span v-text="$t(showMoreButtonLabel || 'seeMore')" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
