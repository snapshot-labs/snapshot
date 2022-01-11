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
 * of seconds. (3678 => { diff: 1, unit: 'hour'}) This is accompanied by manual translations in our message
 * catalogues of strings like "second", "seconds", "minute", "minutes", etc.
 */
const getTimeDiffAndUnit = (seconds: number) => {
  let unit = 'second';
  let diff = seconds;
  const abs = Math.abs(seconds);

  if (abs >= 60) {
    unit = 'minute';
    diff = diff / 60;
    if (abs >= 60 * 60) {
      unit = 'hour';
      diff = diff / 60;
      if (abs >= 60 * 60 * 24) {
        unit = 'day';
        diff = diff / 24;
        if (abs >= 60 * 60 * 24 * 365) {
          unit = 'year';
          diff = diff / 365;
        } else if (abs >= 60 * 60 * 24 * 30) {
          unit = 'month';
          diff = diff / 30;
        } else if (abs >= 60 * 60 * 24 * 7) {
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
  const { currentLocale } = useI18nSnapshot();

  /**
   * functions to create computed formatters based on locale
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
          currentLocale.value,
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
    minimumFractionDigits: 2
  });

  /**
   * formatting functions
   */

  const relativeTime = (
    timestamp: number,
    formatter?: Intl.RelativeTimeFormat
  ) => {
    const relativeTo = new Date().getTime() / 1e3;

    const { diff, unit } = getTimeDiffAndUnit(timestamp - relativeTo);

    formatter = formatter || defaultRelativeTimeFormatter.value;

    return formatter.format(diff, unit);
  };

  // needs the t function, to translate the unit
  const duration = (duration: number, t: Function) => {
    const { diff, unit } = getTimeDiffAndUnit(duration);

    return t(`timeUnits.${unit}`, { n: diff }, diff);
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
    duration,
    formattedNumber,
    formattedCompactNumber,
    formattedPercentNumber
  };
}
