<script setup>
defineProps({
  open: Boolean,
  title: String,
  number: Number,
  hideRemove: Boolean
});

defineEmits(['remove', 'toggle']);
</script>

<template>
  <div class="width-full collapsible-container">
    <div class="collapsible-header d-flex">
      <span class="mr-4 header-number">{{ number }}</span>
      <span
        class="flex-auto text-center no-wrap overflow-hidden"
        @click="$emit('toggle')"
      >
        {{ title }}
      </span>
      <span v-if="!hideRemove" @click="$emit('remove')" class="ml-4">
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
  padding: 0 24px;
  outline: none;
}
.collapsible-header {
  line-height: 46px;
  height: 46px;
  font-size: 18px;
}
.hide {
  display: none;
}
</style>
