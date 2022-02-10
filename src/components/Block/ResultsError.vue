<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <Block :title="$t('results')" icon="warning" iconClass="text-red">
    <div>{{ t('resultsError') }}</div>
    <a href="https://discord.gg/snapshot" target="_blank">
      <UiButton class="w-full mt-3">
        {{ t('getHelp') }}
      </UiButton>
    </a>
  </Block>
</template>
