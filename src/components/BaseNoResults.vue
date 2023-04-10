<script setup lang="ts">
const { t } = useI18n();
defineProps({ useBlock: Boolean });
const text = computed(() => t('noResultsFound'));
</script>

<template>
  <div class="mb-3 text-center">
    <BaseBlock v-if="useBlock" class="pt-1">
      {{ text }}
    </BaseBlock>
    <div v-else>{{ text }}</div>
  </div>
</template>
