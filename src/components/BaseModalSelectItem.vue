<script setup lang="ts">
defineProps<{
  selected?: boolean;
  title: string;
  tag?: string;
  description?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'transition-colors hover:border-skin-text cursor-pointer',
      {
        '!border-skin-link': selected,
        'hover:!border-skin-border hover:!cursor-not-allowed': disabled
      }
    ]"
  >
    <div class="relative inset-y-0 flex items-center">
      <div :class="['w-full text-left', { 'pr-[44px]': selected }]">
        <div class="mb-2 flex items-center gap-2">
          <h3
            :class="[
              'mb-0 truncate',
              { 'mt-0': description, 'text-skin-text': disabled }
            ]"
            v-text="title"
          />
          <BasePill>{{ tag }}</BasePill>
        </div>
        <span class="break-all text-skin-text" v-text="description" />
      </div>
      <i-ho-check v-if="selected" class="absolute right-0 text-md" />
    </div>
  </BaseBlock>
</template>
