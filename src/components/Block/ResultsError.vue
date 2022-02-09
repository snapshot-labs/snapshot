<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <Block :title="$t('results')" icon="warning" iconClass="text-red">
    <div>{{ t('resultsError') }}</div>
    <UiButton class="w-full mt-3">
      <a href="https://discord.gg/snapshot" target="_blank">
        {{ t('getHelp') }}
      </a>
    </UiButton>
  </Block>
</template>
