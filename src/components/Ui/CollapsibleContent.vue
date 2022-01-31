<script>
import chevronIcon from '@/assets/icons/chevron.svg';

export default {
  props: ['open', 'title', 'number', 'hideRemove', 'showArrow', 'borderless'],
  emits: ['toggle'],
  data() {
    return { chevronIcon };
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
          v-bind:class="{ rotate: !open }"
        />
      </div>
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
