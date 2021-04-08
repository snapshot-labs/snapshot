import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import en from '@/locales/default.json';
import languages from '@/locales/languages.json';

export let defaultLocale = 'en-US';

export function getBrowserLocale() {
  if (typeof navigator !== 'undefined') {
    return (
      navigator['userLanguage'] ||
      navigator['language'] ||
      (navigator.languages?.[0] ? navigator.languages[0] : undefined)
    );
  }
  return undefined;
}

const browserLocale = getBrowserLocale();
Object.keys(languages).forEach(locale => {
  if (locale.slice(0, 2) === browserLocale.slice(0, 2)) defaultLocale = locale;
});

const datetimeFormats = {
  en: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
  }
};

export function setI18nLanguage(i18n, locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    i18n.global.locale.value = locale;
  }
  // @ts-ignore
  document.querySelector('html').setAttribute('lang', locale);
}

export function setupI18n(options = { locale: defaultLocale }) {
  const i18n = createI18n(options);
  setI18nLanguage(i18n, options.locale);
  return i18n;
}

export async function loadLocaleMessages(i18n, locale) {
  if (locale === 'en-US') locale = 'default';
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
  );

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}

const i18n = setupI18n({
  locale: defaultLocale,
  // @ts-ignore
  datetimeFormats,
  messages: { 'en-US': en },
  fallbackLocale: 'en-US'
});

export default i18n;
