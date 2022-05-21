import { useI18n } from '@/composables/useI18n';
import { useClipboard } from '@vueuse/core';
import { useFlashNotification } from '@/composables/useFlashNotification';

export function useCopy() {
  const { t } = useI18n();
  const { copy, copied } = useClipboard();
  const { notify } = useFlashNotification();

  function copyToClipboard(text) {
    copy(text);
    if (copied) notify(t('notify.copied'));
  }

  return { copyToClipboard };
}
