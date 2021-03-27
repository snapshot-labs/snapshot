import { createI18n } from 'vue-i18n';
import messages from '@/locales';

messages['en-US'] = messages.default;
delete messages.default;

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

export let defaultLocale = 'en-US';

const browserLocale = getBrowserLocale();
Object.keys(messages).forEach(locale => {
  if (locale.slice(0, 2) === browserLocale.slice(0, 2)) defaultLocale = locale;
});

const numberFormats = {
  en: {
    currency: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    },
    price: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  }
};

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

const i18n = createI18n({
  locale: defaultLocale,
  datetimeFormats,
  numberFormats,
  messages
});

export default i18n;
