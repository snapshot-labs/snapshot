/**
 * Wrapper functions for Intl.RelativeTimeFormat/NumberFormat
 * returning computed properties based on current locale from i18n
 */

import { computed } from 'vue';
import { useI18n as useI18nSnapshot } from '@/composables/useI18n';
// TODO: Resolve name conflict

/**
 * This is needed since Intl still doesn't support durations:
 * https://github.com/tc39/proposal-intl-duration-format (hopefully soon!)
 *
 * The Intl.relativeTimeFormat API (same as basically all libraries like day.js, timeago.js)
 * only supports phrases like "5 hours ago" or "in 35 minutes". But these time durations can be phrased
 * differently, e.g. we also use "12 hours left" instead of "(ends) in 12 hours". For that you need
 * a simple duration formatter, that turns 3600 into "1 hour" and 180000 into "2 days". More granular
 * formats are possible like "1 hour, 30 minutes" (which will be covered by Intl.Duration).
 * For now, this function just returns the biggest/closest unit and the resulting number from an integer
 * of seconds. (3678 => { duration: 1, unit: 'hour'}) This is accompanied by manual translations in our message
 * catalogues of strings like "second", "seconds", "minute", "minutes", etc.
 */
const getDurationAndUnit = (seconds: number) => {
  let unit = 'second';
  let duration = seconds;
  const abs = Math.abs(seconds);

  if (abs >= 60) {
    unit = 'minute';
    duration = duration / 60;
    if (abs >= 60 * 60) {
      unit = 'hour';
      duration = duration / 60;
      if (abs >= 60 * 60 * 24) {
        unit = 'day';
        duration = duration / 24;
        if (abs >= 60 * 60 * 24 * 365) {
          unit = 'year';
          duration = duration / 365;
        } else if (abs >= 60 * 60 * 24 * 30) {
          unit = 'month';
          duration = duration / 30;
        } else if (abs >= 60 * 60 * 24 * 7) {
          unit = 'week';
          duration = duration / 7;
        }
      }
    }
  }

  duration = Math.round(duration);

  return { duration, unit };
};

export function useIntl() {
  const { currentLocale } = useI18nSnapshot();

  /**
   * functions to create computed formatters based on locale
   *
   * If you need a custom format in only one component, you can import these
   * functions to create a custom formatter locally in that component, to use
   * it as the formatting functions' 2nd argument.
   * Otherwise you can add a predefined formatter and a formatting function
   * below and add them to the return list.
   */

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
          // currently we are using only english number formatting because other
          // languages can result in very different string length, which we need to deal with.
          // (en: 10.2k, de: 10.200)
          'en', // currentLocale.value,
          options || { notation: 'standard' }
        )
    );

  /**
   * predefined formatters
   */

  const defaultRelativeTimeFormatter = getRelativeTimeFormatter();
  const defaultNumberFormatter = getNumberFormatter();
  const compactNumberFormatter = getNumberFormatter({
    notation: 'compact',
    compactDisplay: 'short'
  });
  const percentNumberFormatter = getNumberFormatter({
    style: 'percent',
    maximumFractionDigits: 2
  });

  /**
   * formatting functions
   */

  const formatRelativeTime = (
    timestamp: number,
    formatter?: Intl.RelativeTimeFormat
  ) => {
    const relativeTo = new Date().getTime() / 1e3;

    const { duration, unit } = getDurationAndUnit(timestamp - relativeTo);

    formatter = formatter || defaultRelativeTimeFormatter.value;

    return formatter.format(duration, unit);
  };

  // doesn't use Intl (yet), needs useI18n's t function, to translate the unit
  const formatDuration = (seconds: number, t: Function) => {
    const { duration, unit } = getDurationAndUnit(seconds);

    return t(`timeUnits.${unit}`, { n: duration }, duration);
  };

  const formatNumber = (number: number, formatter?: Intl.NumberFormat) => {
    if (number < 0.00001) number = 0;

    formatter = formatter || defaultNumberFormatter.value;

    return formatter.format(number);
  };

  const formatCompactNumber = (number: number) =>
    formatNumber(number, compactNumberFormatter.value);

  const formatPercentNumber = (number: number) =>
    formatNumber(number, percentNumberFormatter.value);

  return {
    getRelativeTimeFormatter,
    getNumberFormatter,
    formatRelativeTime,
    formatDuration,
    formatNumber,
    formatCompactNumber,
    formatPercentNumber
  };
}
