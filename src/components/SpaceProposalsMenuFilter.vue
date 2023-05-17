<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const routeQuery = computed(() => (route.query.q as string) || '');
const stateFilter = computed(() => route.query.state || 'all');
const searchOptions = computed(() => [
  {
    text: t('proposals.states.all'),
    action: 'all',
    extras: { selected: stateFilter.value === 'all' }
  },
  {
    text: t('proposals.states.active'),
    action: 'active',
    extras: { selected: stateFilter.value === 'active' }
  },
  {
    text: t('proposals.states.pending'),
    action: 'pending',
    extras: { selected: stateFilter.value === 'pending' }
  },
  {
    text: t('proposals.states.closed'),
    action: 'closed',
    extras: { selected: stateFilter.value === 'closed' }
  },
  {
    text: t('proposals.states.core'),
    action: 'core',
    extras: { selected: stateFilter.value === 'core' }
  }
]);

const searchSelectedOption = computed(
  () =>
    searchOptions.value.find(option => option.action === route.query.state)
      ?.text ?? t('proposals.states.all')
);

function redirectSearch(e: string) {
  router.push({
    query: { q: routeQuery.value || undefined, state: e }
  });
}

function handleUpdateSearch(e: string) {
  router.push({
    query: { ...route.query, q: e || undefined }
  });
}
</script>

<template>
  <div
    class="w-full rounded-full border border-skin-border pl-3 pr-0 focus-within:!border-skin-text md:max-w-[420px]"
  >
    <div class="flex">
      <BaseSearch
        :model-value="routeQuery"
        :placeholder="$t('searchPlaceholder')"
        class="flex-auto pr-2"
        @update:model-value="handleUpdateSearch"
      />
      <div class="flex items-center border-l" style="height: 44px">
        <BaseMenu
          :items="searchOptions"
          :selected="$t(`proposals.states.${stateFilter}`)"
          @select="redirectSearch"
        >
          <template #button>
            <button class="flex h-full flex-grow items-center">
              <span class="ml-3" v-text="searchSelectedOption" />
              <i-ho-chevron-down
                class="ml-1 mr-[12px] text-xs text-skin-text"
              />
            </button>
          </template>
        </BaseMenu>
      </div>
    </div>
  </div>
</template>
