<template>
  <Layout>
    <template #sidebar-left>
      <Block :slim="true" :title="$t('filters')" class="overflow-hidden">
        <div class="py-3">
          <router-link
            :to="{ name: 'timeline' }"
            v-text="$t('favorites')"
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
        <UiButton class="pr-3">
          {{ $t('proposals.states.all') }}
          <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
        </UiButton>
      </div>
      <Block v-if="loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
      <div v-if="loaded">
        <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
          <TimelineProposal
            :proposal="proposal"
            :space="app.spaces[proposal.msg.space]"
            :i="i"
          />
        </Block>
      </div>
    </template>
  </Layout>
</template>

<script>
import client from '@/helpers/client';
import { formatProposals } from '@/helpers/utils';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {}
    };
  },
  async created() {
    this.loading = true;
    const scope = this.$route.params.scope;
    const spaces =
      scope === 'all' ? [] : Object.keys(this.favoriteSpaces.favorites);
    try {
      const proposals = await client.getTimeline(spaces);
      this.proposals = formatProposals(proposals);
    } catch (e) {
      console.log(e);
    }
    this.loading = false;
    this.loaded = true;
  }
};
</script>
