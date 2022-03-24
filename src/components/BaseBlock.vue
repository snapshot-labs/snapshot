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
}>();
</script>

<template>
  <div
    class="md:rounded-xl md:border bg-skin-block-bg border-skin-border text-base"
  >
    <h4
      v-if="title"
      class="px-4 pt-3 block rounded-t-none md:rounded-t-lg border-y md:border-t-0 border-skin-border"
      style="padding-bottom: 12px"
    >
      {{ title }}
      <UiCounter v-if="counter" :counter="counter" class="ml-1 inline-block" />
      <BaseIcon
        v-if="icon && !iconHref"
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
    </h4>
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
