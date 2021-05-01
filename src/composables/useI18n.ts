import { ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import i18n, {
  defaultLocale,
  setI18nLanguage,
  loadLocaleMessages
} from '@/i18n';

const currentLocale = ref(lsGet('locale', defaultLocale));

export function useI18n() {
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

  return { setLocale, loadLocale };
}
