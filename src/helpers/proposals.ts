import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const { t } = useI18n();
const { formatRelativeTime, formatDuration } = useIntl();

export const relativePeriod = (state: any, start: any, end: any): any => {
  const now: any = new Date().getTime() / 1e3;
  if (state === 'closed') {
    return t('endedAgo', [formatRelativeTime(end)]);
  }
  if (state === 'active') {
    return t('proposalTimeLeft', [formatDuration(end - now, t)]);
  }
  return t('startIn', [formatRelativeTime(start)]);
};
