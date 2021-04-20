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
      <Block v-if="loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
      <div v-if="!loading">
        <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
          <TimelineProposal :proposal="proposal" :i="i" />
        </Block>
      </div>
    </template>
  </Layout>
</template>

<script>
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export default {
  data() {
    return {
      loading: false,
      proposals: {},
      scope: this.$route.params.scope,
      state: 'all'
    };
  },
  watch: {
    state() {
      this.loadProposals();
    }
  },
  methods: {
    selectState(e) {
      this.state = e;
    },
    async loadProposals() {
      this.loading = true;
      const spaces =
        this.scope === 'all' ? [] : Object.keys(this.favoriteSpaces.favorites);
      try {
        const proposals = await subgraphRequest(
          `${process.env.VUE_APP_HUB_URL}/graphql`,
          {
            timeline: {
              __args: {
                spaces,
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
        this.proposals = proposals.timeline;
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  },
  async created() {
    await this.loadProposals();
  }
};
</script>
