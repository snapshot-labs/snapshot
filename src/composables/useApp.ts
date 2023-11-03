import domains from '@/../snapshot-spaces/spaces/domains.json';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';

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

  async function init() {
    await loadLocale();
    await getSkin(domain);
    isReady.value = true;
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
