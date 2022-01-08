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
  <div
    class="w-full text-left collapsible-container"
    v-bind:class="{ borderless }"
  >
    <div class="px-2 collapsible-header flex items-stretch">
      <div
        class="flex items-center flex-auto flex-nowrap ml-2"
        @click="$emit('toggle')"
      >
        <span class="overflow-hidden" style="line-height: 1">
          {{ title }}
        </span>
      </div>
      <div
        v-if="showArrow"
        class="flex items-center cursor-pointer mr-3"
        @click="$emit('toggle')"
      >
        <img
          :src="chevronIcon"
          alt="arrow"
          class="arrow"
          v-bind:class="{ rotate: open }"
        />
      </div>
      <div
        v-if="!hideRemove"
        class="flex items-center cursor-pointer mr-2"
        @click="copy"
      >
        <Icon style="color: #b2b5b2" name="copy" size="20" />
      </div>
    </div>
    <div
      :class="{ hide: open, pre }"
      class="bg-gray-200 text-black border-gray-400 border"
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
.pre {
  white-space: pre;
  max-height: 300px;
  overflow-y: auto;
}
</style>
