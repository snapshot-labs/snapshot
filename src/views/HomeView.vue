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
      class="mb-4 flex flex-col flex-wrap items-center xs:flex-row md:flex-nowrap"
    >
      <BaseButton
        class="w-full pl-3 pr-0 focus-within:!border-skin-link md:max-w-[420px]"
      >
        <TheSearchBar />
      </BaseButton>
      <BaseDropdown
        class="mt-2 w-full xs:w-auto sm:mr-2 md:ml-2 md:mt-0"
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
        @select="selectCategory($event)"
      >
        <template #button>
          <BaseButton
            class="w-full whitespace-nowrap pr-3"
            :disabled="!orderedSpaces.length"
          >
            <div class="leading-2 flex items-center leading-3">
              <BaseIcon size="16" name="apps" class="mb-[2px] mr-2" />
              <span v-if="selectedCategory">
                {{ $tc('explore.categories.' + selectedCategory) }}
              </span>
              <span v-else>
                {{ $tc('explore.categories.all') }}
              </span>
              <i-ho-chevron-down class="ml-1 text-xs text-skin-text" />
            </div>
          </BaseButton>
        </template>
        <template #item="{ item }">
          <div class="flex">
            <span class="mr-3">{{ item.text }}</span>
            <span class="ml-auto mt-[-3px] flex">
              <BaseCounter :counter="item.count" class="my-auto" />
            </span>
          </div>
        </template>
      </BaseDropdown>
      <div
        v-if="spacesLoaded"
        class="mt-2 whitespace-nowrap text-right text-skin-text xs:mt-0 xs:ml-auto"
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
        class="grid gap-4 md:grid-cols-3 lg:grid-cols-4"
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
      <div
        v-if="!spacesLoaded"
        class="grid gap-4 opacity-40 md:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="i in 12"
          :key="i"
          class="min-h-[266px] animate-pulse bg-skin-border md:rounded-xl"
        ></div>
      </div>
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
    <div ref="endElement" />
  </div>
</template>
