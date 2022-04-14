import { computed, ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useSpaces } from '@/composables/useSpaces';
import aliases from '@/spaces/aliases.json';

let domain = window.location.hostname;
let env = 'master';
if (domain.includes('localhost')) env = 'local';
if (domain === 'demo.snapshot.org') env = 'develop';

if (env === 'local') {
  domain = import.meta.env.VITE_VIEW_AS_DOMAIN as string ?? domain;
}

const domainAlias = Object.keys(aliases).find(
  alias => aliases[alias] === domain
);

const { login } = useWeb3();

const ready = ref(false);

// only affects small screens
const showSidebar = ref(false);

const skinClass = ref('default');

export function useApp() {
  const { loadLocale } = useI18n();
  const { getSpaces, getCustomDomainSpace, customDomainSpace } = useSpaces();

  async function init() {
    const auth = getInstance();
    await loadLocale();
    await getCustomDomainSpace(domain);
    if (customDomainSpace.value?.skin) {
      skinClass.value = customDomainSpace.value.skin;
    }
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
    domain,
    domainAlias,
    env,
    ready,
    init,
    showSidebar,
    skinClass,
    isCustomDomain: computed(() => !!customDomainSpace.value)
  };
}
