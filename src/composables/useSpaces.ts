import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import verifiedSpacesCategories from '@/../snapshot-spaces/spaces/categories.json';
import { SPACES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

// holds all spaces but with reduced data
const spaces: any = ref([]);
const spacesLoaded = ref(false);

// holds visited spaces with extended data
const extendedSpaces: any = ref([]);

export function useSpaces() {
  const route = useRoute();
  const { apolloQuery } = useApolloQuery();

  async function getSpaces() {
    const exploreObj: any = await fetch(
      `${import.meta.env.VITE_HUB_URL}/api/explore`
    ).then(res => res.json());

    exploreObj.spaces = Object.fromEntries(
      Object.entries(exploreObj.spaces).map(([id, space]: any) => {
        // map manually selected categories for verified spaces that don't have set their categories yet
        // set to empty array if space.categories is missing
        space.categories = space.categories?.length
          ? space.categories
          : verifiedSpacesCategories[id]?.length
          ? verifiedSpacesCategories[id]
          : [];

        return [id, { id, ...space }];
      })
    );

    spaces.value = exploreObj.spaces;
    spacesLoaded.value = true;
    return;
  }

  async function loadExtendedSpaces(id_in: string[] = []) {
    try {
      const response = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in
          }
        },
        'spaces'
      );
      
      // loop through response, add new spaces and update existing ones
      for (const space of response) {
        const existingSpaceIndex = extendedSpaces.value.findIndex(
          s => s.id === space.id
        );
        if (existingSpaceIndex !== -1) {
          extendedSpaces.value[existingSpaceIndex] = space;
        } else {
          extendedSpaces.value.push(space);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectedCategory = ref('');

  const testnetNetworks = Object.entries(networks)
    .filter((network: any) => network[1].testnet)
    .map(([id]) => id);

  const orderedSpaces = computed(() => {
    const network = route.query.network || '';
    const q = route.query.q?.toString() || '';
    const list = Object.keys(spaces.value)
      .map(key => {
        const followers = spaces.value[key].followers ?? 0;
        // const voters1d = spaces.value[key].voters_1d ?? 0;
        const followers1d = spaces.value[key].followers_1d ?? 0;
        // const proposals1d = spaces.value[key].proposals_1d ?? 0;
        const isVerified = verified[key] || 0;
        let score = followers1d + followers / 4;
        if (isVerified === 1) score = score * 2;
        const testnet = testnetNetworks.includes(spaces.value[key].network);
        return {
          ...spaces.value[key],
          followers,
          // Hide private spaces, unless the search query exactly matches
          // the space key
          private:
            route.query.q?.toString() === key
              ? false
              : spaces.value[key].private ?? false,
          score,
          testnet
        };
      })
      .filter(space => !space.private && verified[space.id] !== -1)
      .filter(space => space.network === network || !network)
      .filter(space =>
        JSON.stringify(space).toLowerCase().includes(q.toLowerCase())
      );

    return orderBy(list, ['score', 'testnet'], ['desc', 'asc', 'desc']);
  });

  const orderedSpacesByCategory = computed(() =>
    orderedSpaces.value.filter(
      space =>
        !selectedCategory.value ||
        (space.categories && space.categories.includes(selectedCategory.value))
    )
  );

  return {
    getSpaces,
    spaces,
    spacesLoaded,
    orderedSpaces,
    orderedSpacesByCategory,
    selectedCategory,
    loadExtendedSpaces,
    extendedSpaces
  };
}
