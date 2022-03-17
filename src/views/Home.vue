<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useSpaces } from '@/composables/useSpaces';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useCategories } from '@/composables/useCategories';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { useI18n } from '@/composables/useI18n';

const {
  selectedCategory,
  orderedSpaces,
  orderedSpacesByCategory,
  spacesLoaded
} = useSpaces();
const { followingSpaces } = useFollowSpace();
const { spacesPerCategory, categoriesOrderedBySpaceCount } = useCategories();
const { formatCompactNumber } = useIntl();
const { setPageTitle } = useI18n();

function selectCategory(c) {
  selectedCategory.value = c === selectedCategory.value ? '' : c;
}

const { getProposals } = useUnseenProposals();
watchEffect(() => getProposals(followingSpaces.value));

// Scroll
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
    <BaseContainer
      class="flex items-center mb-4 flex-col xs:flex-row flex-wrap md:flex-nowrap"
    >
      <BaseButton class="pl-3 pr-0 w-full md:max-w-[420px]">
        <SearchWithFilters />
      </BaseButton>
      <BaseDropdown
        class="w-full xs:w-auto md:ml-2 sm:mr-2 mt-2 md:mt-0"
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
        <template v-slot:button>
          <BaseButton
            class="w-full pr-3 whitespace-nowrap"
            :disabled="!orderedSpaces.length"
          >
            <BaseIcon size="16" name="apps" class="mt-1 mr-2" />
            <span v-if="selectedCategory">
              {{ $tc('explore.categories.' + selectedCategory) }}
            </span>
            <span v-else>
              {{ $tc('explore.categories.all') }}
            </span>
            <BaseIcon size="16" name="arrow-down" class="mt-1 mx-1" />
          </BaseButton>
        </template>
        <template v-slot:item="{ item }">
          <div class="flex">
            <span class="mr-3">{{ item.text }}</span>
            <span class="flex ml-auto mt-[-3px]">
              <UiCounter :counter="item.count" class="my-auto" />
            </span>
          </div>
        </template>
      </BaseDropdown>
      <div
        class="mt-2 xs:mt-0 xs:ml-auto text-right whitespace-nowrap text-skin-text"
      >
        {{
          $tc('spaceCount', [
            formatCompactNumber(orderedSpacesByCategory.length)
          ])
        }}
      </div>
    </BaseContainer>
    <BaseContainer :slim="true">
      <TransitionGroup
        name="fade"
        tag="div"
        class="grid lg:grid-cols-4 md:grid-cols-3 gap-[1px] md:gap-4"
      >
        <div
          v-for="space in orderedSpacesByCategory.slice(0, limit)"
          :key="space.id"
        >
          <router-link
            :to="{ name: 'spaceProposals', params: { key: space.id } }"
          >
            <!-- Added mb-0 to remove mb-4 added by block component -->
            <BaseBlock
              class="text-center mb-0 hover:border-skin-text transition-all flex justify-center items-center"
              style="height: 266px"
            >
              <div class="relative inline-block mb-2">
                <AvatarSpace
                  :space="space"
                  symbolIndex="space"
                  size="82"
                  class="mb-1"
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
              <ButtonFollow class="!mb-0" :space="space" />
            </BaseBlock>
          </router-link>
        </div>
      </TransitionGroup>
      <div
        v-if="!spacesLoaded"
        class="opacity-40 grid lg:grid-cols-4 md:grid-cols-3 gap-[1px] md:gap-4"
      >
        <div
          class="bg-skin-border animate-pulse min-h-[266px] md:rounded-xl"
          v-for="i in 12"
          :key="i"
        ></div>
      </div>
      <NoResults
        v-else-if="Object.keys(orderedSpacesByCategory).length < 1"
        useBlock
      />
      <div class="text-center">
        <BaseButton
          v-if="!enableInfiniteScroll && orderedSpacesByCategory.length > limit"
          class="mt-4"
          @click="loadMoreSpaces()"
        >
          {{ $t('homeLoadmore') }}
        </BaseButton>
      </div>
    </BaseContainer>
    <div ref="endElement" />
  </div>
</template>
