<script setup lang="ts">
const { d } = useI18n();

const props = withDefaults(
  defineProps<{
    period?: number | null;
    date: number;
  }>(),
  {
    period: 0
  }
);

const dateString = computed(() => d(props.date * 1e3, 'short', 'en-US'));

const emit = defineEmits(['select']);
</script>

<template>
  <InputDate
    type="end"
    :title="$t(`create.end`)"
    :disabled="!!period"
    :date="date"
    :date-string="dateString"
    :tooltip="!!period ? $t('create.periodEnforced') : null"
    @update:date="emit('select', $event)"
  />
</template>
