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
    <BaseAnchor
      v-if="isAdmin"
      link="https://discord.gg/snapshot"
      class="mt-3 block"
      hide-external-icon
    >
      <UiButton class="w-full">
        {{ t('getHelp') }}
      </UiButton>
    </BaseAnchor>
  </Block>
</template>
