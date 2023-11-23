<script setup lang="ts">
const { copyToClipboard } = useCopy();

defineProps<{
  open: boolean;
  title: string;
  text: string;
  hideRemove?: boolean;
  showArrow: boolean;
  pre?: boolean;
}>();

defineEmits(['toggle']);
</script>

<template>
  <UiCollapsibleContent
    :open="open"
    :title="title"
    :show-arrow="showArrow"
    @toggle="$emit('toggle')"
  >
    <template #icons>
      <button
        v-if="!hideRemove"
        class="mr-2 flex cursor-pointer items-center"
        @click="copyToClipboard(text)"
      >
        <BaseIcon style="color: #b2b5b2" name="copy" size="20" />
      </button>
    </template>
    <div
      :class="{ pre }"
      class="border border-gray-400 bg-gray-200 text-black"
      style="
        border-radius: 8px;
        margin: 0 12px 12px;
        overflow-wrap: break-word;
        line-height: 18px;
        padding: 12px;
      "
    >
      {{ text }}
    </div>
  </UiCollapsibleContent>
</template>

<style scoped lang="scss">
.pre {
  white-space: pre;
  max-height: 300px;
  overflow-y: auto;
}
</style>
