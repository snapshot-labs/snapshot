<script setup lang="ts">
const { t, d } = useI18n();

const props = withDefaults(
  defineProps<{
    delay?: number | null;
    date: number;
  }>(),
  {
    delay: 0
  }
);

const dateString = computed(() =>
  Math.round(props.date / 10) ===
  Math.round(Number((Date.now() / 1e3).toFixed()) / 10)
    ? t('create.now')
    : d(props.date * 1e3, 'short', 'en-US')
);

const emit = defineEmits(['select']);
</script>

<template>
  <InputDate
    type="start"
    :title="$t(`create.start`)"
    :disabled="!!delay"
    :date="date"
    :date-string="dateString"
    :tooltip="!!delay ? $t('create.delayEnforced') : null"
    @update:date="emit('select', $event)"
  />
</template>
