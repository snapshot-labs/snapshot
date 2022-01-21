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
  <div class="w-full collapsible-container" v-bind:class="{ borderless }">
    <div class="px-2 collapsible-header flex items-center">
      <div class="mr-4 header-number" v-if="number !== undefined">
        {{ number }}
      </div>
      <span
        class="flex-auto text-center flex flex-nowrap justify-center overflow-hidden"
        @click="$emit('toggle')"
      >
        {{ title }}
      </span>
      <span
        v-if="!hideRemove"
        @click="$emit('remove')"
        class="ml-1 cursor-pointer -mr-2 px-3"
      >
        <Icon name="close" size="12" />
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
  margin-top: 7px; // (46px header height - 32px element height) / 2
}
</style>
