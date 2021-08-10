import { useI18n } from 'vue-i18n';
import { useClipboard } from '@vueuse/core';
import { useNotifications } from '@/composables/useNotifications';

export function useCopy() {
  const { t } = useI18n();
  const { copy, copied } = useClipboard({ read: false });
  const { notify } = useNotifications();

  function copyToClipboard(text) {
    copy(text);
    if (copied) notify(t('notify.copied'));
  }

  return { copyToClipboard };
}
