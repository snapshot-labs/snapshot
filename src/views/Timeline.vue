<template>
  <Layout>
    <template #sidebar-left>
      <div style="position: fixed; width: 240px">
        <Block :slim="true" :title="$t('filters')" class="overflow-hidden">
          <div class="py-3">
            <router-link
              :to="{ name: 'timeline' }"
              v-text="$t('favorites')"
              :class="!scope && 'router-link-exact-active'"
              class="d-block px-4 py-2 sidenav-item"
            />
            <router-link
              :to="{ name: 'timeline', params: { scope: 'all' } }"
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
          <router-link :to="{ name: 'home' }" class="text-gray">
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

      <Block v-if="spaces.length < 1 && !scope" class="text-center">
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
          <TimelineProposal :proposal="proposal" :i="i" />
        </Block>
      </div>
      <div
        style="height: 10px; width: 10px; position: absolute"
        id="endofpage"
      />
      <Block v-if="loadingMore && !loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { scrollEndMonitor } from '@/helpers/utils';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { lsSet } from '@/helpers/utils';
import { useUnseenProposals } from '@/composables/useUnseenProposals';

// Persistent filter state
const filterBy = ref('all');

export default {
  setup() {
    const store = useStore();
    const route = useRoute();

    const favorites = computed(() => store.state.favoriteSpaces.favorites);
    const scope = computed(() => route.params.scope);
    const spaces = computed(() =>
      scope.value === 'all' ? [] : Object.keys(favorites.value)
    );

    const loading = ref(false);
    const proposals = ref([]);

    // Infinite scroll with pagination
    const {
      loadBy,
      limit,
      loadingMore,
      stopLoadingMore,
      loadMore
    } = useInfiniteLoader(12);

    onMounted(() => {
      scrollEndMonitor(() =>
        loadMore(() => loadProposals(limit.value), loading.value)
      );
    });

    // Proposals query
    async function loadProposals(skip = 0) {
      try {
        const response = await subgraphRequest(
          `${process.env.VUE_APP_HUB_URL}/graphql`,
          {
            proposals: {
              __args: {
                first: loadBy,
                skip,
                where: {
                  space_in: spaces.value,
                  state: filterBy.value
                }
              },
              id: true,
              title: true,
              body: true,
              start: true,
              end: true,
              state: true,
              author: true,
              space: {
                id: true,
                name: true,
                members: true
              }
            }
          }
        );
        stopLoadingMore.value = response.proposals?.length < loadBy;
        proposals.value = proposals.value.concat(response.proposals);
      } catch (e) {
        console.log(e);
      }
    }

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

    return {
      scope,
      loading,
      selectState,
      loadingMore,
      filterBy,
      proposals,
      spaces
    };
  }
};
</script>
