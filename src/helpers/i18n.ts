import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import en from '@/locales/default.json';
import languages from '@/locales/languages.json';
import { lsRemove } from '@/helpers/utils';

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

export function setI18nLanguage(i18n, locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    i18n.global.locale.value = locale;
  }
  document.querySelector('html')?.setAttribute('lang', locale);
}

export async function loadLocaleMessages(i18n, locale) {
  if (!Object.keys(languages).includes(locale)) {
    lsRemove('locale');
    locale = 'default';
  }
  if (locale === 'en-US') locale = 'default';

  try {
    // load locale messages with dynamic import
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `../locales/${locale}.json`
    );

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default);
  } catch (e) {
    console.log(e);
  }

  return nextTick();
}

const i18n = createI18n({
  locale: defaultLocale,
  datetimeFormats: {
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  },
  messages: { 'en-US': en },
  fallbackLocale: 'en-US'
});

setI18nLanguage(i18n, defaultLocale);

export default i18n;
