<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  showArrow: boolean;
}>();

defineEmits(['toggle']);
</script>

<template>
  <div class="collapsible-container w-full text-left">
    <div class="collapsible-header flex items-stretch px-2">
      <div
        class="ml-2 flex flex-auto flex-nowrap items-center"
        @click="$emit('toggle')"
      >
        <span class="overflow-hidden" style="line-height: 1">
          {{ title }}
        </span>
      </div>
      <button
        v-if="showArrow"
        class="mr-2 flex cursor-pointer items-center"
        @click="$emit('toggle')"
      >
        <i-ho-chevron-up :class="{ rotate: !open }" class="text-xs" />
      </button>
      <slot name="icons"></slot>
    </div>
    <div :class="{ hide: !open }">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.collapsible-container {
  border: 1px solid var(--border-color);
  color: var(--link-color);
  outline: none;
}

.collapsible-header {
  cursor: pointer;
  line-height: 46px;
  height: 46px;
  font-size: 18px;
}

.hide {
  display: none;
}

.arrow {
  width: 18px;
}

.rotate {
  transform: rotate(180deg);
}
</style>
