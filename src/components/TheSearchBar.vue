<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const emit = defineEmits(['update:inputSearch']);

const input = ref((route.query.q as string) || '');

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

function selectFilter(e) {
  router.push({
    query: { q: routeQuery.value, filter: e }
  });
}

function handleUpdateSearch(e: string) {
  input.value = e;
  emit('update:inputSearch', e);
  router.push({
    query: { ...route.query, q: e || undefined }
  });
}
</script>

<template>
  <div class="flex rounded-full border pl-3 pr-0 focus-within:border-skin-text">
    <BaseSearch
      :model-value="input"
      :placeholder="$t('searchPlaceholder')"
      class="flex-auto pr-2"
      @update:model-value="handleUpdateSearch"
    />
    <div class="flex items-center border-l text-skin-link" style="height: 44px">
      <BaseMenu :items="searchOptions" @select="selectFilter">
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
