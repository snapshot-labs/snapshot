<script setup lang="ts">
defineProps<{
  modelValue: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  tooltip?: string | null;
  definition?: any;
}>();

const emit = defineEmits(['select']);
</script>

<template>
  <div class="w-full">
    <TuneLabelInput
      v-if="label || definition?.title"
      :hint="hint || definition?.description"
    >
      {{ label || definition.title }}
    </TuneLabelInput>
    <TuneButton
      v-tippy="{ content: tooltip }"
      :class="[$attrs.class, { disabled: disabled }]"
      class="tune-button-select"
      :disabled="disabled"
      @click="disabled ? null : emit('select')"
    >
      <span>
        {{ modelValue }}
      </span>
      <i-ho-chevron-down
        class="absolute inset-y-[12px] right-[14px] text-xs text-skin-link"
      />
    </TuneButton>
  </div>
</template>
