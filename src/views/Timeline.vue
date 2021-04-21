<template>
  <Layout>
    <template #sidebar-left>
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
            {{ $t(`proposals.states.${state}`) }}
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

      <NoResults :block="true" v-else-if="this.proposals.length < 1" />
      <div v-else>
        <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
          <TimelineProposal :proposal="proposal" :i="i" />
        </Block>
      </div>
      <div id="scrollsensor"></div>
      <Block v-if="loadingMore && !loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>

<script>
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import scrollMonitor from 'scrollmonitor';

const loadBy = 15;

export default {
  data() {
    return {
      loading: false,
      loadingMore: false,
      stopLoadingMore: false,
      proposals: [],
      scope: this.$route.params.scope,
      state: 'all',
      spaces: [],
      limit: loadBy
    };
  },
  watch: {
    async state() {
      this.proposals = [];
      this.limit = loadBy;
      this.loading = true;
      await this.loadProposals();
      this.loading = false;
    }
  },
  methods: {
    selectState(e) {
      this.state = e;
    },
    async loadProposals(skip = 0) {
      this.spaces =
        this.scope === 'all' ? [] : Object.keys(this.favoriteSpaces.favorites);
      try {
        const proposals = await subgraphRequest(
          `${process.env.VUE_APP_HUB_URL}/graphql`,
          {
            timeline: {
              __args: {
                first: loadBy,
                skip,
                spaces: this.spaces,
                state: this.state
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
        this.stopLoadingMore = proposals.timeline.length < loadBy;
        this.proposals = this.proposals.concat(proposals.timeline);
      } catch (e) {
        console.log(e);
      }
    },
    async loadMoreProposals() {
      this.loadingMore = true;
      await this.loadProposals(this.limit);
      this.limit += loadBy;
      this.loadingMore = false;
    }
  },
  async created() {
    this.loading = true;
    await this.loadProposals();
    this.loading = false;
  },
  mounted() {
    const el = document.getElementById('scrollsensor');
    const elementWatcher = scrollMonitor.create(el);
    elementWatcher.enterViewport(async () => {
      if (!this.stopLoadingMore && this.proposals[0]) {
        this.loadMoreProposals();
      }
    });
  }
};
</script>
