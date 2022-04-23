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
    class="md:rounded-xl md:border border-y bg-skin-block-bg border-skin-border text-base"
  >
    <h4
      v-if="title"
      class="px-4 pt-3 block rounded-t-none md:rounded-t-lg border-b border-skin-border"
      :class="{ 'border-b-0': !$slots.namedDefault }"
      style="padding-bottom: 12px"
    >
      {{ title }}
      <BaseCounter :counter="counter" class="ml-1 inline-block" />
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
    <div
      v-else-if="$slots.namedDefault"
      :class="!slim && 'p-4'"
      class="leading-5 sm:leading-6"
    >
      <slot name="namedDefault" />
    </div>
    <div
      v-else-if="$slots.default"
      :class="!slim && 'p-4'"
      class="leading-5 sm:leading-6"
    >
      <slot />
    </div>
  </div>
</template>
