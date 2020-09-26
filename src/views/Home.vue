<template>
  <div>
    <Container :slim="true">
      <router-link
        v-for="space in spaces"
        :key="space.address"
        :to="{ name: 'proposals', params: { key: space.key } }"
      >
        <Block class="text-center extra-icon-container">
          <Token
            :space="space.key"
            symbolIndex="space"
            size="88"
            class="mb-3"
          />
          <StatefulIcon
            :on="space.favorite"
            onName="star"
            offName="star1"
            @click="toggleFavorite(space.key)"
          />
          <div>
            <h2>
              {{ space.name }}
              <span class="text-gray">{{ space.symbol }}</span>
            </h2>
          </div>
        </Block>
      </router-link>
      <a href="https://discord.snapshot.page" target="_blank">
        <Block class="text-center">
          <div
            v-text="'+'"
            style="width: 88px; height: 88px; color: white; font-size: 76px; padding-top: 2px;"
            class="bg-gray-3 circle mx-auto mb-3"
          />
          <h2 v-text="'Create space'" />
        </Block>
      </a>
    </Container>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import orderBy from 'lodash/orderBy';
import homepage from '@bonustrack/snapshot-spaces/spaces/homepage.json';
import domains from '@bonustrack/snapshot-spaces/spaces/domains.json';

export default {
  data() {
    return {
      domains
    };
  },
  computed: {
    spaces() {
      if (!this.web3.spaces) return {};
      const spaces =
        this.web3.network.chainId === 1
          ? homepage
          : Object.keys(this.web3.spaces);
      const list = spaces.map(key => ({
        ...this.web3.spaces[key],
        favorite: !!this.favoriteSpaces.favorites[key]
      }));
      return orderBy(list, ['favorite'], ['desc']);
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
    }
  },
  created() {
    const domainName = window.location.hostname;
    if (domains[domainName])
      return this.$router.push({
        name: 'proposals',
        params: {
          key: domains[domainName]
        }
      });
    this.loadFavoriteSpaces();
  }
};
</script>
