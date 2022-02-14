<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();

defineProps<{
  isAdmin: boolean;
}>();
</script>

<template>
  <Block :title="$t('results')" icon="warning" iconClass="text-red">
    <div>{{ t('resultsError') }}</div>
    <a
      v-if="isAdmin"
      href="https://discord.gg/snapshot"
      target="_blank"
      class="mt-3 block"
    >
      <UiButton class="w-full">
        {{ t('getHelp') }}
      </UiButton>
    </a>
  </Block>
</template>
