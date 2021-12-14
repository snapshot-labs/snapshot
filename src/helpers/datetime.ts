import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import toObject from 'dayjs/plugin/toObject';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(toObject);
dayjs.extend(customParseFormat);

export function toNow(period: number) {
  return dayjs(period * 1e3).toNow(true);
}

export function relativeTimeFromTimestamp(number) {
  return dayjs.unix(number).fromNow();
}

export function calcFromSeconds(value, unit) {
  if (unit === 'days') {
    return dayjs.duration({ seconds: value }).asDays();
  }

  return dayjs.duration({ seconds: value }).asHours();
}

export function calcToSeconds(value, unit) {
  return dayjs.duration({ [unit]: value }).asSeconds();
}

export function getDateOutput(date) {
  const output = { h: '12', m: '00', dateString: '' };
  if (!date) return output;

  const format = dayjs.unix(date);

  output.dateString = format.format('YYYY-MM-DD');
  output.h = format.hour().toString();
  output.m = String(format.minute()).padStart(2, '0');

  return output;
}

export function getTimestamp(startingDate, hour, minute) {
  const initialDate = dayjs(startingDate, 'YYYY-MM-DD');
  const formatDate = initialDate.hour(hour).minute(minute);

  return formatDate.unix();
}