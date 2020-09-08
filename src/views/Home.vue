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
import spaces from '@/../spaces';
import homepage from '@/../spaces/homepage.json';
import domains from '@/../spaces/domains.json';

export default {
  data() {
    return {
      domains
    };
  },
  computed: {
    spaces() {
      const list = homepage.map(namespace => ({
        ...spaces[namespace],
        favorite: !!this.favoriteSpaces.favorites[namespace]
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
