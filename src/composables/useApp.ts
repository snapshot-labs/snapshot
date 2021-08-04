import { ref, computed, reactive } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';

const state = reactive({
  init: false,
  loading: false
});

const spaces = ref({});
const strategies = ref({});

const { login } = useWeb3();

export function useApp() {
  async function init() {
    const auth = getInstance();
    state.loading = true;
    await Promise.all([getSpaces(), getStrategies()]);
    auth.getConnector().then(connector => {
      if (connector) login(connector);
    });
    state.init = true;
    state.loading = false;
  }

  async function getSpaces() {
    let spacesObj: any = await client.getSpaces();
    spacesObj = Object.fromEntries(
      Object.entries(spacesObj).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );

    spaces.value = spacesObj;
    return spacesObj;
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
    getSpaces,
    app: computed(() => state),
    spaces: computed(() => spaces.value),
    strategies: computed(() => strategies.value)
  };
}
