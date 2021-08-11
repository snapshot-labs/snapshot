<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import spotlight from '@snapshot-labs/snapshot-spaces/spaces/spotlight.json';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useFavoriteSpaces } from '@/composables/useFavoriteSpaces';
import { useApp } from '@/composables/useApp';

const route = useRoute();
const { addFavoriteSpace, removeFavoriteSpace, favorites } =
  useFavoriteSpaces();
const { spaces } = useApp();

const orderedSpaces = computed(() => {
  const networkFilter = route.query.network;
  const q = route.query.q || '';
  const list = Object.keys(spaces.value)
    .map(key => {
      const spotlightIndex = spotlight.indexOf(key);
      return {
        ...spaces.value[key],
        favorite: !!favorites.value[key],
        isActive: !!spaces.value[key]._activeProposals,
        spotlight: spotlightIndex === -1 ? 1e3 : spotlightIndex
      };
    })
    .filter(space => !space.private);
  return orderBy(list, ['favorite', 'spotlight'], ['desc', 'asc']).filter(
    space =>
      (networkFilter ? space.network === networkFilter.toLowerCase() : true) &&
      JSON.stringify(space).toLowerCase().includes(q.toLowerCase())
  );
});

const { numberOfUnseenProposals, getProposalIds } = useUnseenProposals();
watchEffect(() => getProposalIds(favorites.value));

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

const { endElement } = useScrollMonitor(() => (limit.value += loadBy));
</script>

<template>
  <div>
    <div class="text-center mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left d-flex">
          <UiButton class="pl-3 col-12 col-lg-7 pr-0">
            <SearchWithFilters />
          </UiButton>
          <router-link :to="{ name: 'timeline' }" class="ml-2">
            <UiButton class="no-wrap px-3">
              <Icon name="feed" size="18" />
              <UiCounter :counter="numberOfUnseenProposals" class="ml-2" />
            </UiButton>
          </router-link>
        </div>
        <div class="ml-3 text-right hide-sm col-lg-4">
          {{ $tc('spaceCount', [_n(orderedSpaces.length)]) }}
          <router-link :to="{ name: 'setup' }" class="hide-md ml-3">
            <UiButton>{{ $t('createSpace') }}</UiButton>
          </router-link>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div class="overflow-hidden mr-n4">
        <router-link
          v-for="space in orderedSpaces.slice(0, limit)"
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
                  :space="space"
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
                <div class="text-color">{{ space.symbol }}</div>
              </div>
            </Block>
          </div>
        </router-link>

        <NoResults
          :block="true"
          v-if="Object.keys(orderedSpaces).length < 1"
          class="pr-md-4"
        />
      </div>
    </Container>
    <div ref="endElement" />
  </div>
</template>
