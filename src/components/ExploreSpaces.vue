<script setup>
import { ref, onMounted } from 'vue';
import { shorten } from '@/helpers/utils';
import { useRoute, useRouter } from 'vue-router';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import { useScrollMonitor, useSpaces, useIntl, useI18n } from '@/composables';

const { orderedSpacesByCategory, spacesLoaded } = useSpaces();
const { formatCompactNumber } = useIntl();
const { setPageTitle } = useI18n();

const route = useRoute();
const router = useRouter();

const loadBy = 12;
const limit = ref(loadBy);

const enableInfiniteScroll = ref(false);

const loadMoreSpaces = () => {
  enableInfiniteScroll.value = true;
  limit.value += loadBy;
};

const { endElement } = useScrollMonitor(() => {
  if (enableInfiniteScroll.value) {
    limit.value += loadBy;
  }
});

onMounted(() => {
  setPageTitle('page.title.home');
});
</script>

<template>
  <div class="relative">
    <BaseContainer slim>
      <div class="my-2 flex items-center space-x-2">
        <ExploreMenuCategories />

        <BasePill
          v-if="route.query.network"
          class="relative flex items-center gap-1 pr-4"
        >
          {{ networks[route.query.network].name }}
          <BaseButtonIcon
            class="absolute right-0 !text-xs text-white"
            @click="router.push({ query: { network: undefined } })"
          >
            <i-ho-x />
          </BaseButtonIcon>
        </BasePill>
      </div>
      <TransitionGroup
        name="fade"
        tag="div"
        class="grid gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="space in orderedSpacesByCategory.slice(0, limit)"
          :key="space.id"
        >
          <router-link
            :to="{ name: 'spaceProposals', params: { key: space.id } }"
          >
            <BaseBlock
              class="mb-0 flex items-center justify-center text-center transition-all hover:border-skin-text"
              style="height: 266px"
            >
              <div class="relative mb-2 inline-block">
                <AvatarSpace
                  :space="space"
                  symbol-index="space"
                  size="82"
                  class="mb-1"
                />
              </div>
              <h3
                class="mb-0 mt-0 !h-[32px] overflow-hidden pb-0 text-[22px]"
                v-text="shorten(space.name, 16)"
              />
              <div class="mb-[12px] text-skin-text">
                {{
                  $tc('members', space.followers, {
                    count: formatCompactNumber(space.followers)
                  })
                }}
              </div>
              <ButtonFollow class="!mb-0" :space="space" />
            </BaseBlock>
          </router-link>
        </div>
      </TransitionGroup>
      <ExploreSkeletonLoading v-if="!spacesLoaded" is-spaces />
      <BaseNoResults
        v-else-if="Object.keys(orderedSpacesByCategory).length < 1"
        use-block
      />
      <div class="px-4 text-center md:px-0">
        <BaseButton
          v-if="!enableInfiniteScroll && orderedSpacesByCategory.length > limit"
          class="mt-4 w-full"
          @click="loadMoreSpaces()"
        >
          {{ $t('homeLoadmore') }}
        </BaseButton>
      </div>
    </BaseContainer>
    <div class="relative">
      <div ref="endElement" class="absolute h-[10px] w-[10px]" />
    </div>
  </div>
</template>
