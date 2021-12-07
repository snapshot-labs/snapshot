<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApp } from '@/composables/useApp';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useCategories } from '@/composables/useCategories';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const category = ref('');
const route = useRoute();
const { explore } = useApp();
const { followingSpaces } = useFollowSpace();
const { categoriesOrderedBySpaceCount, spacesPerCategory } = useCategories();

function selectCategory(c) {
  category.value = c === category.value ? '' : c;
}

const testnetNetworks = Object.entries(networks)
  .filter(network => network[1].testnet)
  .map(([id]) => id);

const orderedSpaces = computed(() => {
  const network = route.query.network || '';
  const q = route.query.q || '';
  const list = Object.keys(explore.value.spaces)
    .map(key => {
      const following = followingSpaces.value.some(s => s === key);
      const followers = explore.value.spaces[key].followers ?? 0;
      // const voters1d = explore.value.spaces[key].voters_1d ?? 0;
      const followers1d = explore.value.spaces[key].followers_1d ?? 0;
      // const proposals1d = explore.value.spaces[key].proposals_1d ?? 0;
      const isVerified = verified[key] || 0;
      let score = followers1d + followers / 4;
      if (isVerified === 1) score = score * 2;
      const testnet = testnetNetworks.includes(
        explore.value.spaces[key].network
      );
      return {
        ...explore.value.spaces[key],
        following,
        followers,
        private: explore.value.spaces[key].private ?? false,
        score,
        testnet
      };
    })
    .filter(space => (
      !category.value ||
      (space.categories && space.categories.includes(category.value))
    ))
    .filter(space => !space.private && verified[space.id] !== -1)
    .filter(space => space.network === network || !network)
    .filter(space => JSON.stringify(space).toLowerCase().includes(q.toLowerCase()));

  return orderBy(
    list,
    ['following', 'testnet', 'score'],
    ['desc', 'asc', 'desc']
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
  <div class="mt-4">
    <Container class="flex items-center mb-4">
      <UiButton class="mr-auto pl-3 pr-0 w-full max-w-[420px]">
        <SearchWithFilters />
      </UiButton>
      <div class="ml-3 text-right hidden md:block whitespace-nowrap">
        {{ $tc('spaceCount', [_n(category ? spacesPerCategory[category] : Object.keys(explore.spaces).length)]) }}
      </div>
      <UiDropdown
        class="ml-3 z-10"
        top="3.5rem"
        right="1.25rem"
        @select="selectCategory($event)"
        :items="[
          {
            text: $tc('explore.categories.all'),
            action: '',
            count: Object.keys(explore.spaces).length,
            selected: !category
          },
          ...categoriesOrderedBySpaceCount.map(c => ({
            text: $tc('explore.categories.' + c),
            action: c,
            count: spacesPerCategory[c],
            selected: category === c
          }))
        ]
        "
      >
        <UiButton class="pr-3 whitespace-nowrap">
          <Icon size="14" name="apps" class="mt-1 mr-2" />
          <span v-if="category">
            {{ $tc('explore.categories.' + category) }}
          </span>
          <span v-else>
            {{ $tc('explore.categories.all') }}
          </span>
          <Icon size="14" name="arrow-down" class="mt-1 mx-1" />
        </UiButton>
        <template v-slot:item="{ item }">
          <div class="flex">
            <span class="mr-3">{{ item.text }}</span>
            <span class="ml-auto dropdown-badge">{{ _n(item.count) }}</span>
          </div>
        </template>
      </UiDropdown>
    </Container>
    <Container :slim="true">
      <div class="grid lg:grid-cols-4 md:grid-cols-3 gap-4">
        <div v-for="space in orderedSpaces.slice(0, limit)" :key="space.id">
          <router-link
            :to="{ name: 'spaceProposals', params: { key: space.id } }"
          >
            <!-- Added mb-0 to remove mb-4 added by block component -->
            <Block
              class="text-center extra-icon-container mb-0 hover-border"
              style="height: 266px"
            >
              <div class="relative inline-block mb-2">
                <Token
                  :space="space"
                  symbolIndex="space"
                  size="82"
                  class="mb-1"
                />
                <UiCounter
                  v-if="space.activeProposals"
                  :counter="space.activeProposals"
                  class="absolute top-0 right-0 !bg-green"
                />
              </div>
              <h3
                v-text="_shorten(space.name, 16)"
                class="mb-0 pb-0 mt-0 text-[22px] !h-[32px] overflow-hidden"
              />
              <div class="mb-[12px] text-color">
                {{
                  $tc('members', space.followers, {
                    count: _n(space.followers)
                  })
                }}
              </div>
              <FollowButton class="!mb-0" :space="space" />
            </Block>
          </router-link>
        </div>
      </div>
      <NoResults :block="true" v-if="Object.keys(orderedSpaces).length < 1" />
    </Container>
    <div ref="endElement" />
  </div>
</template>
