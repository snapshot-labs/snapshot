<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('language') }}</h3>
    </template>
    <div class="text-center mt-4 mb-3 px-4 width-full">
      <UiButton
        v-for="locale in locales"
        :key="locale"
        @click="selectLang(locale)"
        class="width-full mb-2"
      >
        {{ locale === 'en-US' ? '' : languages[locale].nativeName + ' - ' }}
        {{ languages[locale].name }}
      </UiButton>
    </div>
  </UiModal>
</template>

<script>
import { computed } from 'vue';
import languages from '@/locales/languages.json';
import { useI18n } from '@/composables/useI18n';

export default {
  setup(_, { emit }) {
    const { setLocale } = useI18n();

    const locales = computed(() => Object.keys(languages));

    function selectLang(locale) {
      setLocale(locale);
      emit('close');
    }

    return { selectLang, locales, languages };
  }
};
</script>
