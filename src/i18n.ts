import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    message: {
      EMPTY_STATE: 'No results found'
    }
  }
};
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
  locale: 'en',
  datetimeFormats,
  numberFormats,
  messages
});

export default i18n;
