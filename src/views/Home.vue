<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApp } from '@/composables/useApp';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useCategories } from '@/composables/useCategories';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { useI18n } from '@/composables/useI18n';

const { selectedCategory, orderedSpaces, orderedSpacesByCategory } = useApp();
const { followingSpaces } = useFollowSpace();
const { spacesPerCategory, categoriesOrderedBySpaceCount } = useCategories();
const { formatCompactNumber } = useIntl();
const { setPageTitle } = useI18n();

function selectCategory(c) {
  selectedCategory.value = c === selectedCategory.value ? '' : c;
}

const { getProposalIds } = useUnseenProposals();
watchEffect(() => getProposalIds(followingSpaces.value));

// Scroll
const loadBy = 16;
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
  <div class="mt-4 min-h-[calc(100vh-145px)] relative pb-[130px]">
    <Container class="flex items-center mb-4">
      <UiButton class="pl-3 pr-0 w-full max-w-[420px]">
        <SearchWithFilters />
      </UiButton>
      <UiDropdown
        class="ml-2 mr-auto z-10"
        top="3.5rem"
        right="1.25rem"
        @select="selectCategory($event)"
        :items="[
          {
            text: $tc('explore.categories.all'),
            action: '',
            count: orderedSpaces.length,
            selected: !selectedCategory
          },
          ...categoriesOrderedBySpaceCount
            .filter(c => spacesPerCategory[c])
            .map(c => ({
              text: $tc('explore.categories.' + c),
              action: c,
              count: spacesPerCategory[c],
              selected: selectedCategory === c
            }))
        ]"
      >
        <UiButton
          class="pr-3 whitespace-nowrap"
          :disabled="!orderedSpaces.length"
        >
          <Icon size="14" name="apps" class="mt-1 mr-2" />
          <span v-if="selectedCategory">
            {{ $tc('explore.categories.' + selectedCategory) }}
          </span>
          <span v-else>
            {{ $tc('explore.categories.all') }}
          </span>
          <Icon size="14" name="arrow-down" class="mt-1 mx-1" />
        </UiButton>
        <template v-slot:item="{ item }">
          <div class="flex">
            <span class="mr-3">{{ item.text }}</span>
            <span class="flex ml-auto mt-[-3px]">
              <UiCounter :counter="item.count" class="my-auto" />
            </span>
          </div>
        </template>
      </UiDropdown>
      <div class="ml-3 text-right hidden md:block whitespace-nowrap">
        {{
          $tc('spaceCount', [
            formatCompactNumber(orderedSpacesByCategory.length)
          ])
        }}
      </div>
    </Container>
    <Container :slim="true">
      <div class="grid lg:grid-cols-4 md:grid-cols-3 gap-4">
        <div
          v-for="space in orderedSpacesByCategory.slice(0, limit)"
          :key="space.id"
        >
          <router-link
            :to="{ name: 'spaceProposals', params: { key: space.id } }"
          >
            <!-- Added mb-0 to remove mb-4 added by block component -->
            <Block
              class="text-center mb-0 hover:border-skin-link"
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
                v-text="shorten(space.name, 16)"
                class="mb-0 pb-0 mt-0 text-[22px] !h-[32px] overflow-hidden"
              />
              <div class="mb-[12px] text-skin-text">
                {{
                  $tc('members', space.followers, {
                    count: formatCompactNumber(space.followers)
                  })
                }}
              </div>
              <FollowButton class="!mb-0" :space="space" />
            </Block>
          </router-link>
        </div>
      </div>
      <NoResults
        :block="true"
        v-if="Object.keys(orderedSpacesByCategory).length < 1"
      />
      <UiButton
        v-if="!enableInfiniteScroll && orderedSpacesByCategory.length > limit"
        class="w-full mt-4"
        @click="loadMoreSpaces()"
      >
        {{ $t('homeLoadmore') }}
      </UiButton>
    </Container>
    <Footer />
    <div ref="endElement" />
  </div>
</template>
