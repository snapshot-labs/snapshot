<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { lsSet } from '@/helpers/utils';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useProfiles } from '@/composables/useProfiles';
import { useFavoriteSpaces } from '@/composables/useFavoriteSpaces';

const filterBy = ref('all');
const loading = ref(false);
const proposals = ref([]);

const route = useRoute();
const { favorites: favoriteSpaces } = useFavoriteSpaces();

const favorites = computed(() =>
  route.name === 'timeline' ? favoriteSpaces.value : []
);
const favoritesKeys = computed(() => Object.keys(favorites.value));

const { loadBy, limit, loadingMore, stopLoadingMore, loadMore } =
  useInfiniteLoader();

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadProposals(limit.value), loading.value)
);

const { apolloQuery } = useApolloQuery();
async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: favoritesKeys.value,
        state: filterBy.value
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  proposals.value = proposals.value.concat(proposalsObj);
}

const { profiles, addressArray } = useProfiles();

watch(proposals, () => {
  addressArray.value = proposals.value.map(proposal => proposal.author);
});

// Initialize
onMounted(load());

async function load() {
  loading.value = true;
  await loadProposals();
  loading.value = false;
}

// Change filter
function selectState(e) {
  filterBy.value = e;
  proposals.value = [];
  limit.value = loadBy;
  load();
}

// Save the most recently seen proposalId in localStorage
const { getProposalIds, proposalIds } = useUnseenProposals();
onMounted(async () => {
  await getProposalIds(favorites.value);
  if (proposalIds.value[0])
    lsSet('lastSeenProposalId', proposalIds.value[0].id);
});
</script>

<template>
  <Layout>
    <template #sidebar-left>
      <div style="position: fixed; width: 240px">
        <Block :slim="true" :title="$t('filters')" class="overflow-hidden">
          <div class="py-3">
            <router-link
              :to="{ name: 'timeline' }"
              v-text="$t('favorites')"
              class="d-block px-4 py-2 sidenav-item"
            />
            <router-link
              :to="{ name: 'explore' }"
              v-text="$t('allSpaces')"
              class="d-block px-4 py-2 sidenav-item"
            />
          </div>
        </Block>
      </div>
    </template>
    <template #content-right>
      <div class="px-4 px-md-0 mb-3 d-flex">
        <div class="flex-auto">
          <router-link :to="{ name: 'home' }" class="text-color">
            <Icon name="back" size="22" class="v-align-middle" />
            {{ $t('backToHome') }}
          </router-link>
          <div class="d-flex flex-items-center flex-auto">
            <h2>{{ $t('timeline') }}</h2>
          </div>
        </div>
        <UiDropdown
          top="3.5rem"
          right="1.25rem"
          @select="selectState"
          :items="[
            { text: $t('proposals.states.all'), action: 'all' },
            { text: $t('proposals.states.active'), action: 'active' },
            { text: $t('proposals.states.pending'), action: 'pending' },
            { text: $t('proposals.states.closed'), action: 'closed' }
          ]"
        >
          <UiButton class="pr-3">
            {{ $t(`proposals.states.${filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
      </div>

      <Block
        v-if="favoritesKeys.length < 1 && $route.name === 'timeline'"
        class="text-center"
      >
        <div class="mb-3">{{ $t('noFavorites') }}</div>
        <router-link :to="{ name: 'home' }">
          <UiButton>{{ $t('addFavorites') }}</UiButton>
        </router-link>
      </Block>

      <Block v-else-if="loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>

      <NoResults :block="true" v-else-if="proposals.length < 1" />
      <div v-else>
        <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
          <TimelineProposal :proposal="proposal" :profiles="profiles" />
        </Block>
      </div>
      <div
        style="height: 10px; width: 10px; position: absolute"
        ref="endElement"
      />
      <Block v-if="loadingMore && !loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>
