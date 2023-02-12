import { onMounted } from 'vue';
import { useI18n } from '@/composables';

type metaInfo = {
  title: {
    key: string;
    params?: Record<string, string>;
  };
  description: {
    key: string;
    params?: Record<string, string>;
  };
};

export function useMeta(metaInfo: metaInfo) {
  const { t } = useI18n();

  function createMetaDescription() {
    if (document.querySelector('meta[name="description"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'description';
    document.getElementsByTagName('head')[0].appendChild(meta);
  }

  onMounted(() => {
    if (metaInfo.title.key)
      document.title = t(metaInfo.title.key, metaInfo.title.params || {});
    if (metaInfo.description.key) {
      createMetaDescription();
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          'content',
          t(metaInfo.description.key, metaInfo.description.params || {})
        );
    }
  });

  return {};
}
