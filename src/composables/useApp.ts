import { ref, computed, reactive } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';

const state = reactive({
  init: false,
  loading: false
});

const strategies = ref({});

const { login } = useWeb3();

export function useApp() {
  async function init() {
    const auth = getInstance();
    state.loading = true;
    await getStrategies();
    auth.getConnector().then(connector => {
      if (connector) login(connector);
    });
    state.init = true;
    state.loading = false;
  }

  async function getStrategies() {
    const strategiesObj: any = await fetch(
      'https://score.snapshot.org/api/strategies'
    ).then(res => res.json());
    strategies.value = strategiesObj;
    return strategiesObj;
  }

  return {
    init,
    app: computed(() => state),
    strategies: computed(() => strategies.value)
  };
}
