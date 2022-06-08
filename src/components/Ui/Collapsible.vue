<script setup>
defineProps({
  open: Boolean,
  title: String,
  number: Number,
  hideRemove: Boolean,
  borderless: Boolean
});

defineEmits(['remove', 'toggle']);
</script>

<template>
  <div class="collapsible-container w-full" v-bind:class="{ borderless }">
    <div class="collapsible-header flex items-center px-2">
      <div class="header-number mr-4" v-if="number !== undefined">
        {{ number }}
      </div>
      <span
        class="flex flex-auto flex-nowrap justify-center overflow-hidden text-center"
        style="min-height: 24px"
        @click="$emit('toggle')"
      >
        {{ title }}
      </span>
      <span
        v-if="!hideRemove"
        @click="$emit('remove')"
        class="ml-1 -mr-2 cursor-pointer px-3"
      >
        <BaseIcon name="close" size="12" />
      </span>
    </div>

    <div :class="{ hide: !open }" class="p-2">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.collapsible-container {
  border: 1px solid var(--border-color);
  color: var(--link-color);
  border-radius: 23px;
  outline: none;
}
.collapsible-container.borderless {
  border-radius: 0;
  border: none;
}
.collapsible-header {
  cursor: pointer;
  height: 46px;
  font-size: 18px;
}
.hide {
  display: none;
}
.header-number {
  border: 1px solid var(--border-color);
  padding: 2px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
}
</style>
