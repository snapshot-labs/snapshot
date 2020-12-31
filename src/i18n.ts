import { createI18n } from 'vue-i18n';

const locale = 'en-US';

const i18n = createI18n({
  locale,
  messages: {
    en: {
      messages: {
        EMPTY_STATE: 'No results found'
      }
    }
  },
  numberFormats: {
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
  },
  dateTimeFormats: {
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  }
});

export default i18n;
