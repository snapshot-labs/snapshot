import { ref, computed, reactive } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';

const state = reactive({
  init: false,
  loading: false
});

const explore: any = ref({});
const strategies = ref({});

const { login } = useWeb3();

export function useApp() {
  async function init() {
    const auth = getInstance();
    state.loading = true;
    await Promise.all([getExplore(), getStrategies()]);
    auth.getConnector().then(connector => {
      if (connector) login(connector);
    });
    state.init = true;
    state.loading = false;
  }

  async function getExplore() {
    const exploreObj: any = await fetch(
      'https://hub.snapshot.org/api/explore'
    ).then(res => res.json());

    exploreObj.spaces = Object.fromEntries(
      Object.entries(exploreObj.spaces).map((space: any) => [
        space[0],
        {
          key: space[0],
          ...space[1]
        }
      ])
    );

    explore.value = exploreObj;
    return;
  }

  async function getStrategies() {
    const strategiesObj: any = await fetch(
      'https://score.snapshot.org/api/strategies'
    ).then(res => res.json());
    strategies.value = strategiesObj;
    return;
  }

  return {
    init,
    getExplore,
    app: computed(() => state),
    spaces: computed(() => explore.value?.spaces || {}),
    explore: computed(() => explore.value),
    strategies: computed(() => strategies.value)
  };
}
