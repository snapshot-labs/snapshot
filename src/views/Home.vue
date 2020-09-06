<template>
  <div>
    <Container :slim="true">
      <router-link
        v-for="namespace in homepage"
        :key="spaces[namespace].address"
        :to="{ name: 'proposals', params: { key: namespace } }"
      >
        <Block class="text-center relative">
          <Token :space="namespace" size="88" class="mb-3" />
          <ExtraIcon @click="toggleFavorite(namespace)">{{
            favoriteSpaces[namespace] ? 'Remove' : 'Add'
          }}</ExtraIcon>
          <div>
            <h2>
              {{ spaces[namespace].name }}
              <span class="text-gray">{{ spaces[namespace].symbol }}</span>
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
import spaces from '@/../spaces';
import homepage from '@/../spaces/homepage.json';
import domains from '@/../spaces/domains.json';

export default {
  data() {
    return {
      spaces,
      homepage,
      domains
    };
  },
  computed: {
    favoriteSpaces() {
      return this.$store.state.favoriteSpaces.favorites;
    }
  },
  methods: {
    ...mapActions([
      'loadFavoriteSpaces',
      'addFavoriteSpace',
      'removeFavoriteSpace'
    ]),
    toggleFavorite(spaceId) {
      if (this.favoriteSpaces[spaceId]) this.removeFavoriteSpace(spaceId);
      else this.addFavoriteSpace(spaceId);
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
