import { ref } from 'vue';
import { domain, customDomainSpace, env } from '@/helpers/domain';
import { useI18n } from '@/composables/useI18n';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useSpaces } from '@/composables/useSpaces';
import { useTheme } from '@/composables/useTheme';

const { login } = useWeb3();

const ready = ref(false);

// only affects small screens
const showSidebar = ref(false);

let skinClass = 'default';

export function useApp() {
  const { loadLocale } = useI18n();
  const { getSpaces } = useSpaces();
  useTheme();

  async function init() {
    const auth = getInstance();
    await loadLocale();
    
    if (customDomainSpace) {
      if (customDomainSpace.skin) skinClass = customDomainSpace.skin;
    } else {
      await getSpaces();
    }
    document.documentElement.setAttribute('class', skinClass);
    ready.value = true;

    // Auto connect with gnosis-connector when inside gnosis-safe iframe
    if (window?.parent === window)
      auth.getConnector().then(connector => {
        if (connector) login(connector);
      });
    else login('gnosis');
  }

  return {
    domain,
    env,
    ready,
    init,
    showSidebar,
    skinClass,
    isCustomDomain: !!customDomainSpace
  };
}
