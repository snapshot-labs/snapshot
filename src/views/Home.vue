<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import orderBy from 'lodash/orderBy';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApp } from '@/composables/useApp';
import { useFollowSpace } from '@/composables/useFollowSpace';

const route = useRoute();
const { explore } = useApp();
const { followingSpaces } = useFollowSpace();

const orderedSpaces = computed(() => {
  const q = route.query.q || '';
  const list = Object.keys(explore.value.spaces)
    .map(key => {
      return {
        ...explore.value.spaces[key],
        following: followingSpaces.value.some(s => s === key),
        followers: explore.value.spaces[key].followers ?? 0,
        private: explore.value.spaces[key].private ?? false
      };
    })
    .filter(space => !space.private);

  return orderBy(list, ['following', 'followers'], ['desc', 'desc']).filter(
    space => JSON.stringify(space).toLowerCase().includes(q.toLowerCase())
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
      <div class="grid lg:grid-cols-4 md:grid-cols-3 gap-4">
        <a
          @click="
            $router.push({ name: 'proposals', params: { key: space.id } })
          "
          v-for="space in orderedSpaces.slice(0, limit)"
          :key="space.id"
        >
          <div>
            <!-- Added mb-0 to remove mb-4 added by block component -->
            <Block
              class="text-center extra-icon-container mb-0"
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
                {{ $tc('members', space.followers) }}
              </div>
              <FollowButton :space="space" class="!bg-white" />
            </Block>
          </div>
        </a>
      </div>
      <NoResults :block="true" v-if="Object.keys(orderedSpaces).length < 1" />
    </Container>
    <div ref="endElement" />
  </div>
</template>
