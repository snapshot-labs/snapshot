import { useHead } from '@vueuse/head';

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

  useHead({
    title: t(metaInfo.title.key, metaInfo.title.params || {}),
    meta: [
      {
        name: 'description',
        content: t(metaInfo.description.key, metaInfo.description.params || {})
      }
    ]
  });

  return {};
}
