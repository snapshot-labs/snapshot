<template>
  <Layout>
    <template #sidebar-left>
      <Block :slim="true" :title="$t('filters')" class="overflow-hidden">
        <div class="py-3">
          <router-link
            :to="{ name: 'timeline' }"
            v-text="$t('favorites')"
            :class="!state.scope && 'router-link-exact-active'"
            class="d-block px-4 py-2 sidenav-item"
          />
          <router-link
            :to="{ name: 'timeline', params: { scope: 'all' } }"
            v-text="$t('allSpaces')"
            class="d-block px-4 py-2 sidenav-item"
          />
        </div>
      </Block>
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
            {{ $t(`proposals.states.${state.state}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
      </div>

      <Block v-if="state.spaces.length < 1 && !state.scope" class="text-center">
        <div class="mb-3">{{ $t('noFavorites') }}</div>
        <router-link :to="{ name: 'home' }">
          <UiButton>{{ $t('addFavorites') }}</UiButton>
        </router-link>
      </Block>

      <Block v-else-if="state.loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>

      <NoResults :block="true" v-else-if="loadedItems.length < 1" />
      <div v-else>
        <Block :slim="true" v-for="(proposal, i) in loadedItems" :key="i">
          <TimelineProposal :proposal="proposal" :i="i" />
        </Block>
      </div>
      <div id="endpage" />
      <Block v-if="loadingMore && !state.loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>

<script>
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { useInfiniteLoader } from '@/composables/useInifiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';

import { onMounted, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { routeState } from '@/composables/useRoute';

export default {
  setup() {
    // Infinite scroll
    const {
      loadBy,
      limit,
      loadingMore,
      loadedItems,
      stopLoadingMore,
      loadMore
    } = useInfiniteLoader();

    onMounted(() => {
      useScrollMonitor(() => loadMore(() => loadProposals()));
    });

    // Proposals query
    const store = useStore();
    const favorites = computed(() => store.state.favoriteSpaces.favorites);
    const { routeParams } = routeState();

    const state = reactive({
      loading: false,
      spaces: [],
      state: 'all',
      scope: routeParams.value.scope
    });

    async function loadProposals(skip = 0) {
      state.spaces = state.scope === 'all' ? [] : Object.keys(favorites.value);
      try {
        const response = await subgraphRequest(
          `${process.env.VUE_APP_HUB_URL}/graphql`,
          {
            timeline: {
              __args: {
                first: loadBy,
                skip,
                spaces: state.spaces,
                state: state.state
              },
              id: true,
              name: true,
              start: true,
              end: true,
              state: true,
              author: {
                address: true
              },
              space: {
                id: true,
                name: true,
                members: true
              }
            }
          }
        );
        stopLoadingMore.value = response.timeline?.length < loadBy;
        loadedItems.value = loadedItems.value.concat(response.timeline);
      } catch (e) {
        console.log(e);
      }
    }

    // Initialize
    onMounted(load());

    async function load() {
      state.loading = true;
      await loadProposals();
      state.loading = false;
    }

    // Change filter
    function selectState(e) {
      state.state = e;
      loadedItems.value = [];
      limit.value = loadBy;
      load();
    }

    return { state, selectState, loadingMore, loadedItems };
  }
};
</script>
