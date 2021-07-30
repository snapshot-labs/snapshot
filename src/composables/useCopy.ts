import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useClipboard } from '@vueuse/core';

export function useCopy() {
  const { t } = useI18n();
  const store = useStore();
  const { copy, copied } = useClipboard();

  function copyToClipboard(text) {
    copy(text);
    if (copied) store.dispatch('notify', t('notify.copied'));
  }

  return { copyToClipboard };
}
