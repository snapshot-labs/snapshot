import { ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import i18n, {
  defaultLocale,
  setI18nLanguage,
  loadLocaleMessages
} from '@/helpers/i18n';

const currentLocale = ref(lsGet('locale', defaultLocale));

export function useI18n() {
  const { t, d, tc } = i18n.global;

  async function setLocale(locale) {
    currentLocale.value = locale;
    lsSet('locale', locale);
    await loadLocaleMessages(i18n, locale);
    setI18nLanguage(i18n, locale);
  }

  async function loadLocale() {
    await loadLocaleMessages(i18n, currentLocale.value);
    setI18nLanguage(i18n, currentLocale.value);
  }

  function setPageTitle(message, params: any = {}) {
    document.title = t(message, params);
  }

  function getDefinitionTitle(definition) {
    const title = definition?.title;
    if (!title) return null;
    const translatedTitle = t(title) === title ? title : t(title);
    return translatedTitle;
  }

  function getDefinitionDescription(definition) {
    const description = definition?.description;
    if (!description) return null;
    const translatedDescription =
      t(description) === description ? description : t(description);
    return translatedDescription;
  }

  return {
    t,
    d,
    tc,
    setLocale,
    loadLocale,
    currentLocale,
    setPageTitle,
    getDefinitionTitle,
    getDefinitionDescription
  };
}
