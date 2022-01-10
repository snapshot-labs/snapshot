/**
 * Wrapper functions for Intl.RelativeTimeFormat/NumberFormat
 * returning computed properties based on current locale from i18n
 */

import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';

const getTimeDiffAndUnit = (seconds: number) => {
  let unit = 'seconds';
  let diff = seconds;
  const abs = Math.abs(seconds);

  if (abs > 60) {
    unit = 'minute';
    diff = diff / 60;
    if (abs > 60 * 60) {
      unit = 'hour';
      diff = diff / 60;
      if (abs > 60 * 60 * 24) {
        unit = 'day';
        diff = diff / 24;
        if (abs > 60 * 60 * 24 * 365) {
          unit = 'year';
          diff = diff / 365;
        } else if (abs > 60 * 60 * 24 * 30) {
          unit = 'month';
          diff = diff / 30;
        } else if (abs > 60 * 60 * 24 * 7) {
          unit = 'week';
          diff = diff / 7;
        }
      }
    }
  }

  diff = Math.round(diff);

  return { diff, unit };
};

export function useIntl() {
  const { currentLocale } = useI18n();

  const getRelativeTimeFormatter = (options?: object) =>
    computed(
      () =>
        new Intl.RelativeTimeFormat(
          currentLocale.value,
          options || { style: 'short', numeric: 'always' }
        )
    );

  const getNumberFormatter = (options?: object) =>
    computed(
      () =>
        new Intl.NumberFormat(
          currentLocale.value,
          options || { notation: 'standard' }
        )
    );

  const defaultRelativeTimeFormatter = getRelativeTimeFormatter();
  const defaultNumberFormatter = getNumberFormatter();
  const compactNumberFormatter = getNumberFormatter({
    notation: 'compact',
    compactDisplay: 'short'
  });
  const percentNumberFormatter = getNumberFormatter({
    style: 'percent',
    minimumFractionDigits: 2
  });

  const relativeTime = (
    timestamp: number,
    formatter?: Intl.RelativeTimeFormat
  ) => {
    const relativeTo = new Date().getTime() / 1e3;

    const { diff, unit } = getTimeDiffAndUnit(timestamp - relativeTo);

    formatter = formatter || defaultRelativeTimeFormatter.value;

    return formatter.format(diff, unit);
  };

  const formattedNumber = (number: number, formatter?: Intl.NumberFormat) => {
    if (number < 0.00001) number = 0;

    formatter = formatter || defaultNumberFormatter.value;

    return formatter.format(number);
  };

  const formattedCompactNumber = (number: number) =>
    formattedNumber(number, compactNumberFormatter.value);

  const formattedPercentNumber = (number: number) =>
    formattedNumber(number, percentNumberFormatter.value);

  return {
    getRelativeTimeFormatter,
    getNumberFormatter,
    relativeTime,
    formattedNumber,
    formattedCompactNumber,
    formattedPercentNumber
  };
}
