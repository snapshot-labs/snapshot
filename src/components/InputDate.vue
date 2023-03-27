<script setup lang="ts">
defineProps<{
  title?: string;
  information?: string;
  dateString?: string;
  date: number;
  disabled?: boolean;
  type?: string;
  tooltip: string | null;
}>();

defineEmits(['update:date']);

const modalDateSelectOpen = ref(false);
</script>

<template>
  <div class="w-full">
    <LabelInput :information="information">{{ title }}</LabelInput>
    <BaseButton
      v-tippy="{ content: tooltip }"
      class="relative inset-y-0 flex !h-[42px] w-full items-center truncate pl-[44px] pr-3 text-left"
      :class="[disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
      @click="disabled ? null : (modalDateSelectOpen = true)"
    >
      <span :class="{ 'text-skin-text opacity-60': disabled }">
        {{ dateString }}
      </span>
      <i-ho-calendar
        class="absolute left-[16px] -mt-[1px] text-sm text-skin-text"
      />
    </BaseButton>
  </div>
  <teleport to="#modal">
    <ModalSelectDate
      :type="type"
      :open="modalDateSelectOpen"
      :value="date"
      @close="modalDateSelectOpen = false"
      @input="$emit('update:date', $event)"
    />
  </teleport>
</template>
