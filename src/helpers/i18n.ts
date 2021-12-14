import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import en from '@/locales/default.json';
import languages from '@/locales/languages.json';
import { lsRemove } from '@/helpers/utils';
import { setDayjsLocale } from '@/helpers/datetime';

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

// Look for exact match first (like de-AU), then only first 2 chars (de), then fallback to default (en-US).
export const defaultLocale =
  Object.keys(languages).find(l => l === browserLocale) ??
  Object.keys(languages).find(
    l => l.slice(0, 2) === browserLocale.slice(0, 2)
  ) ??
  'en-US';

const datetimeFormats = {
  'en-US': {
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

export function setupI18n(options = { legacy: false, locale: defaultLocale }) {
  const i18n = createI18n(options);
  setI18nLanguage(i18n, options.locale);
  return i18n;
}

export async function loadLocaleMessages(i18n, locale) {
  if (!Object.keys(languages).includes(locale)) {
    lsRemove('locale');
    locale = defaultLocale;
  }

  try {
    // load locale messages with dynamic import
    const filename = locale === 'en-US' ? 'default' : locale;
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `../locales/${filename}.json`
    );

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages);
    await setDayjsLocale(locale);
  } catch (e) {
    console.log(e);
  }

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
