<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps({ useBlock: Boolean });
const text = computed(() => t('noResultsFound'));
</script>

<template>
  <div class="mb-3 text-center">
    <Block v-if="useBlock" class="pt-1">
      {{ text }}
    </Block>
    <div v-else>{{ text }}</div>
  </div>
</template>
