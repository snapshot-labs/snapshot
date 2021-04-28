<template>
  <div>
    <div class="text-center mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left d-flex">
          <!--
          <router-link :to="{ name: 'timeline' }" class="mr-2">
            <UiButton class="no-wrap px-3">
              <Icon name="feed" size="18" />
              <UiCounter :counter="numberOfUnseenProposals" class="ml-2" />
            </UiButton>
          </router-link>
          -->
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="q" :placeholder="$t('searchPlaceholder')" />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm">
          {{ $tc('spaceCount', [_n(spaces.length)]) }}
          <router-link :to="{ name: 'setup' }" class="hide-md ml-3">
            <UiButton>{{ $t('createSpace') }}</UiButton>
          </router-link>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div class="overflow-hidden mr-n4">
        <router-link
          v-for="space in spaces.slice(0, limit)"
          :key="space.key"
          :to="{ name: 'proposals', params: { key: space.key } }"
        >
          <div class="col-12 col-lg-3 pr-4 float-left">
            <Block
              class="text-center extra-icon-container"
              style="height: 250px; margin-bottom: 24px !important"
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

        <NoResults
          :block="true"
          v-if="Object.keys(spaces).length < 1"
          class="pr-md-4"
        />
      </div>
    </Container>
    <div id="endofpage" />
  </div>
</template>

<script>
import { onMounted, ref, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import spotlight from '@snapshot-labs/snapshot-spaces/spaces/spotlight.json';
import { scrollEndMonitor } from '@/helpers/utils';
import { useUnseenProposals } from '@/composables/useUnseenProposals';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const favorites = computed(() => store.state.favoriteSpaces.favorites);
    const stateSpaces = computed(() => store.state.app.spaces);

    const q = ref(route.query.q || '');

    const spaces = computed(() => {
      const list = Object.keys(stateSpaces.value)
        .map(key => {
          const spotlightIndex = spotlight.indexOf(key);
          return {
            ...stateSpaces.value[key],
            favorite: !!favorites.value[key],
            isActive: !!stateSpaces.value[key]._activeProposals,
            spotlight: spotlightIndex === -1 ? 1e3 : spotlightIndex
          };
        })
        .filter(space => !space.private);
      return orderBy(
        list,
        ['favorite', 'spotlight'],
        ['desc', 'asc']
      ).filter(space =>
        JSON.stringify(space).toLowerCase().includes(q.value.toLowerCase())
      );
    });

    // Get number of unseen proposals
    const { numberOfUnseenProposals } = useUnseenProposals();
    // watchEffect(() => getProposalIds(favorites.value));

    // Favorites
    const addFavoriteSpace = spaceId =>
      store.dispatch('addFavoriteSpace', spaceId);
    const removeFavoriteSpace = spaceId =>
      store.dispatch('removeFavoriteSpace', spaceId);

    function toggleFavorite(spaceId) {
      if (favorites.value[spaceId]) {
        removeFavoriteSpace(spaceId);
      } else {
        addFavoriteSpace(spaceId);
      }
    }

    // Scroll
    const loadBy = 16;
    const limit = ref(loadBy);

    onMounted(() => {
      scrollEndMonitor(() => (limit.value += loadBy));
    });

    return { q, limit, spaces, toggleFavorite, numberOfUnseenProposals };
  }
};
</script>
