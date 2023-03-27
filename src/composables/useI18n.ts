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

  return {
    t,
    d,
    tc,
    setLocale,
    loadLocale,
    currentLocale
  };
}
