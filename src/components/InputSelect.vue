<script setup lang="ts">
defineProps<{
  modelValue: string;
  title: string;
  information?: string;
  disabled?: boolean;
  tooltip?: string | null;
}>();

const emit = defineEmits(['select']);
</script>

<template>
  <div class="w-full">
    <LabelInput :information="information">{{ title }}</LabelInput>
    <BaseButton
      v-tippy="{ content: tooltip }"
      :class="[$attrs.class, { 'cursor-not-allowed': disabled }]"
      class="relative !h-[42px] w-full truncate pl-3 pr-5 text-left"
      @click="disabled ? null : emit('select')"
    >
      <span :class="{ 'text-skin-text opacity-60': disabled }">
        {{ modelValue }}
      </span>
      <i-ho-chevron-down
        class="absolute inset-y-[12px] right-[14px] text-xs text-skin-text"
      />
    </BaseButton>
  </div>
</template>
