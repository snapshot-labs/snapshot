<template>
  <div>
    <div class="text-center mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left">
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="q" placeholder="Search" />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm">
          {{ _numeral(spaces.length) }} space(s)
          <router-link :to="{ name: 'setup' }" class="hide-md ml-3">
            <UiButton>Create space</UiButton>
          </router-link>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="0"
        class="overflow-hidden mr-n4"
      >
        <router-link
          v-for="space in spaces.slice(0, limit)"
          :key="space.key"
          :to="{ name: 'proposals', params: { key: space.key } }"
        >
          <div class="col-12 col-lg-3 pr-4 float-left">
            <Block
              class="text-center extra-icon-container"
              style="height: 250px; margin-bottom: 24px !important;"
            >
              <span class="position-relative d-inline-block">
                <UiCounter
                  v-if="space._activeProposals"
                  :counter="space._activeProposals"
                  class="position-absolute top-4 right-0 bg-green"
                />
                <Token
                  :space="space.key"
                  symbolIndex="space"
                  size="98"
                  class="my-3"
                />
              </span>
              <StatefulIcon
                :on="space.favorite"
                onName="star"
                offName="star1"
                @click="toggleFavorite(space.key)"
              />
              <div class="">
                <h3 v-text="space.name" />
                <div class="text-gray">{{ space.symbol }}</div>
              </div>
            </Block>
          </div>
        </router-link>
      </div>
    </Container>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import orderBy from 'lodash/orderBy';
import spotlight from '@snapshot-labs/snapshot-spaces/spaces/spotlight.json';

export default {
  data() {
    return {
      q: this.$route.query.q || '',
      limit: 16
    };
  },
  computed: {
    spaces() {
      const list = Object.keys(this.app.spaces).map(key => {
        const spotlightIndex = spotlight.indexOf(key);
        return {
          ...this.app.spaces[key],
          favorite: !!this.favoriteSpaces.favorites[key],
          spotlight: spotlightIndex === -1 ? 1e3 : spotlightIndex
        };
      });
      return orderBy(list, ['favorite', 'spotlight'], ['desc', 'asc']).filter(
        space =>
          JSON.stringify(space)
            .toLowerCase()
            .includes(this.q.toLowerCase())
      );
    }
  },
  methods: {
    ...mapActions([
      'loadFavoriteSpaces',
      'addFavoriteSpace',
      'removeFavoriteSpace'
    ]),
    toggleFavorite(spaceId) {
      if (this.favoriteSpaces.favorites[spaceId]) {
        this.removeFavoriteSpace(spaceId);
      } else {
        this.addFavoriteSpace(spaceId);
      }
    },
    loadMore() {
      this.limit += 16;
    }
  },
  created() {
    this.loadFavoriteSpaces();
  }
};
</script>
