<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  number: number;
  hideRemove: boolean;
  borderless?: boolean;
  showArrow?: boolean;
  showEdit?: boolean;
}>();

defineEmits(['remove', 'toggle', 'edit']);
</script>

<template>
  <div class="collapsible-container w-full" :class="{ borderless }">
    <div class="collapsible-header flex items-center px-3">
      <div
        v-if="number !== undefined"
        class="header-number mr-4 flex justify-center"
      >
        {{ number }}
      </div>
      <span
        class="flex flex-auto flex-nowrap overflow-hidden text-center"
        style="min-height: 24px"
        @click="$emit('toggle')"
      >
        {{ title }}
      </span>
      <span v-if="showEdit" class="edit-icon" @click="$emit('edit')">
        <div>
          <i-ho-pencil :class="'edit-icon'" />
        </div>
      </span>
      <span
        v-if="!hideRemove"
        class="mx-2 cursor-pointer"
        @click="$emit('remove')"
      >
        <BaseIcon name="close" size="12" />
      </span>
      <span v-if="showArrow" class="arrow-icon" @click="$emit('toggle')">
        <div :class="{ rotate: open }" class="arrow">
          <i-ho-chevron-down />
        </div>
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
  border: 1px solid var(--text-color);
  padding: 2px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
}
.arrow-icon {
  cursor: pointer;
}
.edit-icon {
  cursor: pointer;
  width: 16px;
  width: 16px;
}
.arrow {
  transition: transform 0.25s ease-in-out;
}
.rotate {
  transform: rotate(180deg);
}
</style>
