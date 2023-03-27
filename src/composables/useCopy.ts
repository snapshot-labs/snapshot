import { useClipboard } from '@vueuse/core';

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
