<script setup>
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const routeQuery = computed(() => route.query.q || undefined);
const searchOptions = computed(() => [
  {
    text: t('spaces'),
    action: 'spaces',
    extras: { selected: route.query.filter === 'spaces' }
  },
  {
    text: t('networks'),
    action: 'networks',
    extras: { selected: route.query.filter === 'networks' }
  },
  {
    text: t('strategiesPage'),
    action: 'strategies',
    extras: { selected: route.query.filter === 'strategies' }
  },
  {
    text: t('plugins'),
    action: 'plugins',
    extras: { selected: route.query.filter === 'plugins' }
  }
]);

const searchSelectedOption = computed(
  () =>
    searchOptions.value.find(option => option.action === route.query.filter)
      ?.text ?? t('spaces')
);

function redirectSearch(e) {
  router.push({
    query: { q: routeQuery.value, filter: e }
  });
}
</script>

<template>
  <div class="flex rounded-full border pl-3 pr-0 focus-within:border-skin-text">
    <BaseSearch
      :model-value="routeQuery || ''"
      :placeholder="$t('searchPlaceholder')"
      class="flex-auto pr-2"
    />
    <div class="flex items-center border-l" style="height: 44px">
      <BaseMenu :items="searchOptions" @select="redirectSearch">
        <template #button>
          <button class="flex h-full flex-grow items-center">
            <span class="ml-3" v-text="searchSelectedOption" />
            <i-ho-chevron-down class="ml-1 mr-[12px] text-xs text-skin-text" />
          </button>
        </template>
      </BaseMenu>
    </div>
  </div>
</template>
