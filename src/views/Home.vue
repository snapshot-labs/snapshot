<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import spotlight from '@/../snapshot-spaces/spaces/spotlight.json';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApp } from '@/composables/useApp';
import { useFollowSpace } from '@/composables/useFollowSpace';

const route = useRoute();
const { spaces } = useApp();
const { followingSpaces } = useFollowSpace();

const orderedSpaces = computed(() => {
  const networkFilter = route.query.network;
  const q = route.query.q || '';
  const list = Object.keys(spaces.value)
    .map(key => {
      const spotlightIndex = spotlight.indexOf(key);
      return {
        ...spaces.value[key],
        following: followingSpaces.value.some(s => s === key),
        isActive: !!spaces.value[key]._activeProposals,
        spotlight: spotlightIndex === -1 ? 1e3 : spotlightIndex
      };
    })
    .filter(space => !space.private);

  return orderBy(list, ['following', 'spotlight'], ['desc', 'asc']).filter(
    space =>
      (networkFilter ? space.network === networkFilter.toLowerCase() : true) &&
      JSON.stringify(space).toLowerCase().includes(q.toLowerCase())
  );
});

const { getProposalIds } = useUnseenProposals();
watchEffect(() => getProposalIds(followingSpaces.value));

// Scroll
const loadBy = 16;
const limit = ref(loadBy);

const { endElement } = useScrollMonitor(() => (limit.value += loadBy));
</script>

<template>
  <div>
    <div class="text-center mb-4 mx-auto">
      <Container class="flex items-center">
        <div class="flex-auto text-left flex">
          <UiButton class="pl-3 pr-0 w-full md:w-7/12">
            <SearchWithFilters />
          </UiButton>
        </div>
        <div class="ml-3 text-right hidden sm:block lg:w-4/12">
          {{ $tc('spaceCount', [_n(orderedSpaces.length)]) }}
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div class="overflow-hidden -mr-4">
        <a
          @click="
            $router.push({ name: 'proposals', params: { key: space.key } })
          "
          v-for="space in orderedSpaces.slice(0, limit)"
          :key="space.key"
        >
          <div class="w-full lg:w-1/4 pr-4 float-left">
            <Block
              class="text-center extra-icon-container"
              style="height: 250px; margin-bottom: 24px !important"
            >
              <span class="relative inline-block">
                <Token
                  :space="space"
                  symbolIndex="space"
                  size="98"
                  class="mb-1"
                />
                <UiCounter
                  v-if="space._activeProposals"
                  :counter="space._activeProposals"
                  class="absolute top-2 right-0 !bg-green"
                />
              </span>

              <h3
                class="my-1"
                v-text="_shorten(space.name, 16)"
                style="font-size: 22px"
              />
              <FollowButton :space="space" class="!bg-white" />
            </Block>
          </div>
        </a>

        <NoResults
          :block="true"
          v-if="Object.keys(orderedSpaces).length < 1"
          class="md:pr-6"
        />
      </div>
    </Container>
    <div ref="endElement" />
  </div>
</template>
