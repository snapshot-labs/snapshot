import { ref, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useFollowSpace } from '@/composables/useFollowSpace';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const state = reactive({
  init: false,
  loading: false
});

const spaces = ref({});
const strategies = ref({});
const explore: any = ref({});

const { login } = useWeb3();

export function useApp() {
  const route = useRoute();
  const { followingSpaces } = useFollowSpace();

  async function init() {
    const auth = getInstance();
    state.loading = true;
    await Promise.all([getStrategies(), getExplore()]);
    auth.getConnector().then(connector => {
      if (connector) login(connector);
    });
    state.init = true;
    state.loading = false;
  }

  async function getStrategies() {
    const strategiesObj: any = await fetch(
      `${import.meta.env.VITE_SCORES_URL}/api/strategies`
    ).then(res => res.json());
    strategies.value = strategiesObj;
    return;
  }

  async function getExplore() {
    const exploreObj: any = await fetch(
      `${import.meta.env.VITE_HUB_URL}/api/explore`
    ).then(res => res.json());

    exploreObj.spaces = Object.fromEntries(
      Object.entries(exploreObj.spaces).map((space: any) => [
        space[0],
        {
          id: space[0],
          ...space[1]
        }
      ])
    );

    explore.value = exploreObj;
    return;
  }

  const selectedCategory = ref('');

  const testnetNetworks = Object.entries(networks)
    .filter((network:any) => network[1].testnet)
    .map(([id]) => id);

  const orderedSpaces = computed(() => {
    const network = route.query.network || '';
    const q = route.query.q?.toString() || '';
    const list = Object.keys(explore.value.spaces)
      .map(key => {
        const following = followingSpaces.value.some(s => s === key);
        const followers = explore.value.spaces[key].followers ?? 0;
        // const voters1d = explore.value.spaces[key].voters_1d ?? 0;
        const followers1d = explore.value.spaces[key].followers_1d ?? 0;
        // const proposals1d = explore.value.spaces[key].proposals_1d ?? 0;
        const isVerified = verified[key] || 0;
        let score = followers1d + followers / 4;
        if (isVerified === 1) score = score * 2;
        const testnet = testnetNetworks.includes(
          explore.value.spaces[key].network
        );
        return {
          ...explore.value.spaces[key],
          following,
          followers,
          private: explore.value.spaces[key].private ?? false,
          score,
          testnet
        };
      })
      .filter(space => (
        !selectedCategory.value ||
        (space.categories && space.categories.includes(selectedCategory.value))
      ))
      .filter(space => !space.private && verified[space.id] !== -1)
      .filter(space => space.network === network || !network)
      .filter(space => JSON.stringify(space).toLowerCase().includes(q.toLowerCase()));

    return orderBy(
      list,
      ['following', 'testnet', 'score'],
      ['desc', 'asc', 'desc']
    );
  });

  return {
    init,
    getExplore,
    app: computed(() => state),
    spaces: computed(() => spaces.value),
    strategies: computed(() => strategies.value),
    explore: computed(() => explore.value),
    orderedSpaces,
    selectedCategory
  };
}
