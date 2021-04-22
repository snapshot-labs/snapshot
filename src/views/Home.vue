<template>
  <div>
    <div class="text-center mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left">
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="state.q" :placeholder="$t('searchPlaceholder')" />
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
          v-for="space in spaces.slice(0, state.limit)"
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
    <div id="endpage" />
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy';
import spotlight from '@snapshot-labs/snapshot-spaces/spaces/spotlight.json';
import { monitorScroll } from '@/composables/monitor-scroll';

import { onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const route = useRoute();
    const store = useStore();

    const loadBy = 16;
    const favorites = computed(() => store.state.favoriteSpaces.favorites);
    const spacesState = computed(() => store.state.app.spaces);

    const state = reactive({
      q: computed(() => route.query.q || ''),
      limit: loadBy
    });

    const spaces = computed(() => {
      const list = Object.keys(spacesState.value)
        .map(key => {
          const spotlightIndex = spotlight.indexOf(key);
          return {
            ...spacesState.value[key],
            favorite: !!favorites.value[key],
            isActive: !!spacesState.value[key]._activeProposals,
            spotlight: spotlightIndex === -1 ? 1e3 : spotlightIndex
          };
        })
        .filter(space => !space.private);
      return orderBy(
        list,
        ['favorite', 'spotlight'],
        ['desc', 'asc']
      ).filter(space =>
        JSON.stringify(space).toLowerCase().includes(state.q.toLowerCase())
      );
    });

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

    function loadMoreSpaces() {
      state.limit += 16;
    }

    onMounted(async () => {
      monitorScroll(() => loadMoreSpaces());
    });

    return { state, spaces, toggleFavorite };
  }
};
</script>
