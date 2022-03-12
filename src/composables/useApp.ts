import { ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useSkin } from '@/composables/useSkin';
import { useSpaces } from '@/composables/useSpaces';

const { login } = useWeb3();

const ready = ref(false);

export function useApp() {
  const { loadLocale } = useI18n();
  const { getSkin } = useSkin();
  const { getSpaces } = useSpaces();

  async function init() {
    await loadLocale();
    const auth = getInstance();
    await getSkin();
    ready.value = true;
    getSpaces();

    // Auto connect with gnosis-connector when inside gnosis-safe iframe
    if (window?.parent === window)
      auth.getConnector().then(connector => {
        if (connector) login(connector);
      });
    else login('gnosis');
  }

  return {
    ready,
    init
  };
}
