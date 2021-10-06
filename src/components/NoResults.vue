<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps(['block']);

const text = computed(() => t('noResultsFound'));
</script>

<template>
  <div class="mb-3 text-center">
    <Block v-if="block" class="pt-1">
      {{ text }}
    </Block>
    <div v-else>{{ text }}</div>
  </div>
</template>
