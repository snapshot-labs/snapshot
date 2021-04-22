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

      <NoResults :block="true" v-else-if="state.proposals.length < 1" />
      <div v-else>
        <Block :slim="true" v-for="(proposal, i) in state.proposals" :key="i">
          <TimelineProposal :proposal="proposal" :i="i" />
        </Block>
      </div>
      <div id="endpage"></div>
      <Block v-if="state.loadingMore && !state.loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>

<script>
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { monitorScroll } from '@/composables/monitor-scroll';

import { onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();

    const loadBy = 15;
    const favorites = computed(() => store.state.favoriteSpaces.favorites);

    const state = reactive({
      loading: false,
      loadingMore: false,
      stopLoadingMore: false,
      proposals: [],
      spaces: [],
      state: 'all',
      limit: loadBy,
      scope: computed(() => route.params.scope)
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
                address: true,
                name: true,
                ens: true
              },
              space: {
                id: true,
                name: true,
                members: true
              }
            }
          }
        );
        state.stopLoadingMore = response.timeline.length < loadBy;
        state.proposals = state.proposals.concat(response.timeline);
      } catch (e) {
        console.log(e);
      }
    }

    async function selectState(e) {
      state.state = e;
      state.proposals = [];
      state.limit = loadBy;
      state.loading = true;
      await loadProposals();
      state.loading = false;
    }

    async function loadMoreProposals() {
      if (!state.stopLoadingMore && state.proposals[0]) {
        console.log('now', state.loadingMore);
        state.loadingMore = true;
        await loadProposals(state.limit);
        state.limit += loadBy;
        state.loadingMore = false;
      }
    }

    onMounted(async () => {
      monitorScroll(() => loadMoreProposals());
      state.loading = true;
      await loadProposals();
      state.loading = false;
    });

    return { state, selectState };
  }
};
</script>
