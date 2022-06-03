<script setup lang="ts">
import { computed } from 'vue';
import languages from '@/locales/languages.json';
import { useI18n } from '@/composables/useI18n';

const { setLocale } = useI18n();

function selectLang(locale) {
  setLocale(locale);
}

const localeItems = computed<{ text: string; action: string }[]>(() => {
  return Object.keys(languages).map(locale => ({
    text:
      locale === 'en-US'
        ? languages[locale].name
        : languages[locale].nativeName,
    action: locale
  }));
});
</script>

<template>
  <div>
    <BaseDropdown :items="localeItems" @select="selectLang($event)">
      <template v-slot:button>
        <slot />
      </template>
    </BaseDropdown>
  </div>
</template>
