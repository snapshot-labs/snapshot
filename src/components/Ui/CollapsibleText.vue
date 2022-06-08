<script>
import chevronIcon from '@/assets/icons/chevron.svg';
import { useCopy } from '@/composables/useCopy';

export default {
  props: [
    'open',
    'title',
    'number',
    'hideRemove',
    'showArrow',
    'borderless',
    'pre'
  ],
  emits: ['toggle'],
  data() {
    return { chevronIcon };
  },
  setup() {
    const { copyToClipboard } = useCopy();
    return { copyToClipboard };
  },
  methods: {
    copy() {
      const text = this.$slots.default()[0].children;
      this.copyToClipboard(text);
    }
  }
};
</script>

<template>
  <UiCollapsibleContent
    :open="open"
    :title="title"
    :number="number"
    :hideRemove="hideRemove"
    :showArrow="showArrow"
    :borderless="borderless"
    @toggle="$emit('toggle')"
  >
    <template v-slot:icons>
      <div
        v-if="!hideRemove"
        class="mr-2 flex cursor-pointer items-center"
        @click="copy"
      >
        <BaseIcon style="color: #b2b5b2" name="copy" size="20" />
      </div>
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
      <slot />
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
