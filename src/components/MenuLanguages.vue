<script setup lang="ts">
import { computed } from 'vue';
import languages from '@/locales/languages.json';

import { useI18n } from '@/composables';

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
  <BaseMenu :items="localeItems" @select="selectLang($event)">
    <template #button>
      <BaseButton
        class="flex !h-[44px] w-full items-center !text-skin-text hover:!text-skin-link"
      >
        <i-ho-globe class="mr-2" />
        {{
          languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name
        }}
      </BaseButton>
    </template>
  </BaseMenu>
</template>
