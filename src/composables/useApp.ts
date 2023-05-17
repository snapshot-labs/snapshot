import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import domains from '@/../snapshot-spaces/spaces/domains.json';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { getInjected } from '@snapshot-labs/lock/src/utils';

const domainName = window.location.hostname;
const env = import.meta.env.VITE_ENV;
let domain = domains[domainName];

if (env === 'develop') {
  domain = import.meta.env.VITE_VIEW_AS_SPACE ?? domain;
}

const domainAlias = Object.keys(aliases).find(
  alias => aliases[alias] === domain
);

const isReady = ref(false);

// only affects small screens
const showSidebar = ref(false);

export function useApp() {
  const { loadLocale } = useI18n();
  const { getSkin } = useSkin();
  const { login } = useWeb3();

  function connectWallet() {
    if (import.meta.env.VITE_E2E) return;
    const auth = getInstance();

    // Auto connect if previous session was connected
    if (window?.parent === window)
      auth.getConnector().then(connector => {
        if (connector) return login(connector);
      });

    // Auto connect with gnosis-connector when gnosis safe is detected
    login('gnosis');

    const injected = computed(() => getInjected());
    // edge case if MM and CBW are both installed
    if (injected.value?.id === 'metamask') return;
    // Auto connect when coinbase wallet is detected
    if (injected.value?.id === 'coinbase') return login('injected');
  }

  async function init() {
    await loadLocale();
    await getSkin(domain);
    isReady.value = true;
    connectWallet();
  }

  return {
    domain,
    domainAlias,
    env,
    isReady,
    init,
    showSidebar
  };
}
