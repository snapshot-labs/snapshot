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
    class="collapsible-container w-full text-left"
    v-bind:class="{ borderless }"
  >
    <div class="collapsible-header flex items-stretch px-2">
      <div
        class="ml-2 flex flex-auto flex-nowrap items-center"
        @click="$emit('toggle')"
      >
        <span class="overflow-hidden" style="line-height: 1">
          {{ title }}
        </span>
      </div>
      <div
        v-if="showArrow"
        class="mr-3 flex cursor-pointer items-center"
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
